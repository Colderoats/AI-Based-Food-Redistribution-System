let io;

export const initializeAiUpdateEmitter = (socketServer) => {
  io = socketServer;
};

export const emitAiPredictionUpdated = (businessId, prediction) => {
  io?.to(`business:${businessId}`).emit("ai:predictions-updated", {
    inventory_id: prediction.inventory_id,
    risk_tier: prediction.risk_tier,
    risk_score: prediction.risk_score,
    predicted_at: prediction.predicted_at,
  });
};
