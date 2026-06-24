import { db } from './db'

/** Returns the active demo tenant for the platform. */
export async function getTenant() {
  const tenant = await db.tenant.findFirst({
    where: { status: 'active' },
    orderBy: { createdAt: 'asc' },
  })
  if (!tenant) throw new Error('No active tenant found. Run the seed script.')
  return tenant
}

export async function getTenantId() {
  return (await getTenant()).id
}
