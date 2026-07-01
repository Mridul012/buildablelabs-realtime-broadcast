const postToWebhook = async (url: string | undefined, event: string, payload: unknown) => {
  if (!url) {
    return;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`[n8n] ${event} webhook responded with status ${response.status}`);
    }
  } catch (error) {
    console.error(`[n8n] ${event} webhook unreachable:`, error);
  }
};

interface StreamStartedPayload {
  streamId: string;
  title: string;
  creatorId: string;
  creatorUsername: string;
  startedAt: Date;
}

export const notifyStreamStarted = (payload: StreamStartedPayload) => {
  return postToWebhook(process.env.N8N_STREAM_STARTED_WEBHOOK_URL, 'stream-started', payload);
};

interface ViewerMilestonePayload {
  streamId: string;
  title: string;
  viewerCount: number;
}

export const notifyViewerMilestone = (payload: ViewerMilestonePayload) => {
  return postToWebhook(process.env.N8N_VIEWER_MILESTONE_WEBHOOK_URL, 'viewer-milestone', payload);
};

interface StreamEndedPayload {
  streamId: string;
  title: string;
  creatorId: string;
  startedAt: Date;
  endedAt: Date;
  finalViewerCount: number;
}

export const notifyStreamEnded = (payload: StreamEndedPayload) => {
  return postToWebhook(process.env.N8N_STREAM_ENDED_WEBHOOK_URL, 'stream-ended', payload);
};
