import "server-only";

import { PinataSDK } from "pinata";

export const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_SECRET_JWT,
  pinataGateway: `http://${process.env.NEXT_PUBLIC_GATEWAY_URL}`,
});
