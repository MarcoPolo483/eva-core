import { describe, it, expect } from 'vitest';
import { asPlanId, asStepId, asEventId } from '../domain/ids.js';

describe('Domain IDs - Brand Type Helpers', () => {
  it('should create PlanId from string', () => {
    const planId = asPlanId('plan-123');
    expect(planId).toBe('plan-123');
    
    // TypeScript ensures type safety at compile time
    const typedId: string & { __brand: 'PlanId' } = planId;
    expect(typedId).toBe('plan-123');
  });

  it('should create StepId from string', () => {
    const stepId = asStepId('step-456');
    expect(stepId).toBe('step-456');
  });

  it('should create EventId from string', () => {
    const eventId = asEventId('event-789');
    expect(eventId).toBe('event-789');
  });

  it('should handle empty strings', () => {
    expect(asPlanId('')).toBe('');
    expect(asStepId('')).toBe('');
    expect(asEventId('')).toBe('');
  });

  it('should handle UUID format', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    expect(asPlanId(uuid)).toBe(uuid);
    expect(asStepId(uuid)).toBe(uuid);
    expect(asEventId(uuid)).toBe(uuid);
  });
});
