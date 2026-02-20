import { SkyWayAuthToken, nowInSec, uuidV4 } from '@skyway-sdk/token';

export default function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const appId = process.env.SKYWAY_APP_ID;
  const secret = process.env.SKYWAY_SECRET_KEY;

  if (!appId || !secret) {
    return res.status(500).json({ error: 'SkyWay env vars are not set' });
  }

  try {
    const token = new SkyWayAuthToken({
      jti: uuidV4(),
      iat: nowInSec(),
      exp: nowInSec() + 60 * 60,
      scope: {
        app: {
          id: appId,
          turn: true,
          actions: ['read'],
          channels: [
            {
              name: '*',
              actions: ['write', 'read', 'create', 'delete', 'updateMetadata'],
              members: [
                {
                  name: '*',
                  actions: ['write', 'create', 'delete', 'updateMetadata', 'signal'],
                  publication: {
                    actions: ['write', 'create', 'delete', 'updateMetadata', 'enable', 'disable'],
                  },
                  subscription: {
                    actions: ['write', 'create', 'delete'],
                  },
                },
              ],
            },
          ],
        },
      },
    }).encode(secret);

    return res.status(200).json({ token });
  } catch (e) {
    console.error('skyway token generate failed', e);
    return res.status(500).json({ error: 'SkyWay token generation failed' });
  }
}
