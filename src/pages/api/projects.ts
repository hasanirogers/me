import { getCollection } from 'astro:content';

export async function GET() {
  // Get all projects from the collection
  const projects = await getCollection('projects');

  // Extract and transform the frontmatter data
  const projectsData = projects.map(project => ({
    slug: project.id,
    ...project.data,
  }));

  // Return as JSON with appropriate headers
  return new Response(JSON.stringify(projectsData), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
