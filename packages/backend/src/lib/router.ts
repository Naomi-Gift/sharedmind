import { ModelConfig } from '../types';

// All requests go through GPT-4o — single provider, no routing complexity
const GPT4O: ModelConfig = {
  id:         'gpt-4o',
  costPer1k:  0.005,
  provider:   'openai',
  tier:       'complex',
};

export function routeModel(_prompt: string): ModelConfig {
  return GPT4O;
}

export function estimateCost(model: ModelConfig, inputTokens: number, outputTokens: number): number {
  return ((inputTokens + outputTokens) / 1000) * model.costPer1k;
}
