// Model to store email metrics (clicks, opens)
const emailMetricsSchema = new mongoose.Schema({
    email: { type: String, required: true },
    messageId: { type: String, required: true },
    status: { type: String, required: true },  // 'sent', 'opened', 'clicked'
    timestamp: { type: Date, required: true },
    clickedUrl: { type: String }, // Optional, for tracking the clicked URL
  });
  
  const EmailMetrics = mongoose.model('EmailMetrics', emailMetricsSchema);
  