import { AccessToken } from "livekit-server-sdk";

export async function POST(req: Request) {
  const { caseId } = await req.json();

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: `candidate_${Math.random().toString(36).substring(7)}`,
      // We store the caseId in metadata so the Python agent can read it
      metadata: JSON.stringify({ selectedCase: caseId }),
    }
  );

  at.addGrant({ roomJoin: true, room: "interview_room" });
  
  return Response.json({ token: await at.toJwt() });
}