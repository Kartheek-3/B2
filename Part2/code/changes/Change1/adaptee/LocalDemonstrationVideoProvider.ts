/**
 * Adaptee (GoF Adapter Pattern)
 * Provider: Local Demonstration Provider
 *
 * NOTE: This is an explicitly labeled mock/local implementation created for
 * reproducible local demonstration and zero-credential testability.
 * It features a proprietary, incompatible API structure that differs in
 * parameter conventions, epoch timestamps, and return envelopes from the
 * application's domain requirements.
 */

export interface ProprietarySessionPayload {
  sessionTag: string;
  startTimestampEpoch: number;
  hostIdentifier: string;
  guestIdentifier: string;
  metadataPayload?: Record<string, unknown>;
}

export interface ProprietarySessionResponse {
  statusCode: number;
  data: {
    sessionId: string;
    rawEndpointUrl: string;
    initializedAt: number;
    hostName: string;
    guestName: string;
    state: "INITIALIZED" | "IN_PROGRESS" | "CLOSED";
  };
}

export interface ProprietaryTokenResponse {
  statusCode: number;
  tokenData: {
    jwtStub: string;
    accessLink: string;
    validUntilEpoch: number;
    claim: {
      userTag: string;
      roleTag: string;
    };
  };
}

export class LocalDemonstrationVideoProvider {
  private activeSessions: Map<string, ProprietarySessionResponse["data"]> = new Map();

  /**
   * Proprietary method to create session.
   * Expects epoch milliseconds, raw session tags, and returns nested envelope.
   */
  public async initiateMeetingSession(
    payload: ProprietarySessionPayload
  ): Promise<ProprietarySessionResponse> {
    if (!payload.sessionTag) {
      throw new Error("LocalDemonstrationVideoProvider: sessionTag is mandatory");
    }

    const sessionData = {
      sessionId: `ldv_room_${payload.sessionTag}_${Date.now()}`,
      rawEndpointUrl: `https://teleconsult.carepulse.local/rooms/${payload.sessionTag}`,
      initializedAt: Date.now(),
      hostName: payload.hostIdentifier,
      guestName: payload.guestIdentifier,
      state: "INITIALIZED" as const,
    };

    this.activeSessions.set(sessionData.sessionId, sessionData);

    return {
      statusCode: 201,
      data: sessionData,
    };
  }

  /**
   * Proprietary query method.
   */
  public async querySession(
    sessionId: string
  ): Promise<ProprietarySessionResponse["data"] | null> {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * Proprietary token issuance method.
   */
  public async mintJoinToken(
    sessionId: string,
    claimRole: "clinician" | "client",
    subjectName: string
  ): Promise<ProprietaryTokenResponse> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`LocalDemonstrationVideoProvider: Session not found for ID: ${sessionId}`);
    }

    const expiry = Date.now() + 3600 * 1000; // 1 hour
    const tokenStub = Buffer.from(
      JSON.stringify({
        sub: subjectName,
        sid: sessionId,
        role: claimRole,
        exp: expiry,
      })
    ).toString("base64");

    return {
      statusCode: 200,
      tokenData: {
        jwtStub: `ldv.tok.${tokenStub}`,
        accessLink: `${session.rawEndpointUrl}?auth=ldv.tok.${tokenStub}&role=${claimRole}`,
        validUntilEpoch: expiry,
        claim: {
          userTag: subjectName,
          roleTag: claimRole,
        },
      },
    };
  }
}
