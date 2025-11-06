import dbData from "@/data/creaza-db.json"

export async function GET() {
  return Response.json(dbData)
}
