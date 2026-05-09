import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TaskRequest {
  agent_id: string;
  title: string;
  input_data: Record<string, unknown>;
  model: string;
}

interface TaskResponse {
  success: boolean;
  task_id?: string;
  output?: Record<string, unknown>;
  error?: string;
  duration_ms?: number;
}

// Simulated agent responses by model type
function generateAgentResponse(model: string, title: string): string {
  const responses: Record<string, string[]> = {
    'llama3.2': [
      'Research completed. Found 47 relevant sources covering market trends, competitive analysis, and growth projections.',
      'Analysis shows 23% YoY growth in enterprise AI adoption. Key drivers: cost efficiency and ease of deployment.',
      'Generated comprehensive report with executive summary, detailed findings, and strategic recommendations.',
    ],
    'deepseek-coder': [
      'Code review complete. Identified 3 critical issues: memory leak in line 342, race condition in async handler, missing null check.',
      'Performance optimization: Applied ROCm-specific kernels, reduced latency by 34%. Benchmark: 2.1s → 1.4s per inference.',
      'Refactored codebase following SOLID principles. Added 18 unit tests. Coverage now 87%.',
    ],
    'qwen2.5': [
      'Data analysis complete. Computed 42 statistical metrics. Discovered 3 significant outliers (>3σ). Multimodal insights ready.',
      'Multilingual processing enabled. Detected 12 language variants in dataset. Tokenization complete for all variants.',
      'Generated 5 predictive models with cross-validation scores: 0.91, 0.89, 0.92, 0.88, 0.90. Ensemble ready.',
    ],
    'qwen-vl': [
      'Vision analysis: Detected 127 objects across 15 categories. Confidence scores: avg 0.94. Generated scene description.',
      'OCR extraction: Recognized 342 text regions. Processing accuracy 98.7%. Extracted 89 key entities.',
      'Image segmentation complete. Identified 23 distinct regions. Mask quality: dice coefficient 0.91.',
    ],
    'mistral-7b': [
      'Orchestration workflow initialized. Routed task to 3 specialized agents. Result aggregation in progress.',
      'Decision tree evaluation complete. Selected optimal path based on 8 weighted criteria. Confidence: 0.96.',
      'Generated 5 alternative solutions with trade-off analysis. Recommended solution: Option 3 (best ROI).',
    ],
  };

  const modelResponses = responses[model] || responses['llama3.2'];
  return modelResponses[Math.floor(Math.random() * modelResponses.length)];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: TaskRequest = await req.json();
    const { agent_id, title, input_data, model } = body;

    if (!agent_id || !title || !model) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Simulate agent execution time (2-8 seconds depending on model)
    const baseDelay = model.includes('qwen-vl') ? 4000 : model.includes('deepseek') ? 3000 : 2000;
    const jitter = Math.random() * 3000;
    const executionTime = baseDelay + jitter;

    // Generate simulated response
    const agentOutput = generateAgentResponse(model, title);
    const success = Math.random() > 0.08; // 92% success rate

    const response: TaskResponse = {
      success,
      task_id: crypto.randomUUID(),
      duration_ms: Math.floor(executionTime),
      ...(success
        ? {
            output: {
              result: agentOutput,
              tokens_generated: Math.floor(Math.random() * 500 + 100),
              model_inference_ms: Math.floor(Math.random() * 2000 + 500),
              timestamp: new Date().toISOString(),
            },
          }
        : {
            error: "Model response timeout - GPU queue exceeded",
          }),
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
