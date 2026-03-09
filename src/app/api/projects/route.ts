import { NextRequest, NextResponse } from 'next/server';
import { getDb, type Project } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { safeErrorMessage } from '@/lib/errors';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['concept', 'todo', 'active', 'in-review', 'done'] as const;
const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

export async function GET() {
  try {
    const db = getDb();
    const projects = db
      .prepare('SELECT * FROM projects ORDER BY position ASC, created_at DESC')
      .all() as Project[];
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load projects', details: safeErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();
    const id = uuidv4();

    const status = body.status || 'concept';
    const priority = body.priority || 'medium';

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }
    if (!VALID_PRIORITIES.includes(priority)) {
      return NextResponse.json(
        { error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` },
        { status: 400 }
      );
    }

    const maxPos = db
      .prepare('SELECT MAX(position) as maxPos FROM projects WHERE status = ?')
      .get(body.status || 'concept') as { maxPos: number | null };

    const position = (maxPos?.maxPos ?? -1) + 1;

    db.prepare(
      `INSERT INTO projects (id, title, description, status, priority, assignee, position)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      body.title || 'Untitled',
      body.description || '',
      status,
      priority,
      body.assignee || null,
      position
    );

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project;
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create project', details: safeErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getDb();

    if (!body.id) {
      return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
    }

    if (body.status && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }
    if (body.priority && !VALID_PRIORITIES.includes(body.priority)) {
      return NextResponse.json(
        { error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` },
        { status: 400 }
      );
    }

    const UPDATABLE_FIELDS = ['title', 'description', 'status', 'priority', 'assignee', 'position'] as const;
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const key of UPDATABLE_FIELDS) {
      if (body[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(body[key]);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    fields.push("updated_at = datetime('now')");
    values.push(body.id);

    const result = db.prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(body.id) as Project;
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update project', details: safeErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
    }

    const db = getDb();
    const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete project', details: safeErrorMessage(error) },
      { status: 500 }
    );
  }
}
