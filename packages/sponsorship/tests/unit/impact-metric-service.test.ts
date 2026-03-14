/**
 * Unit tests for ImpactMetricService (COMP-027.3).
 */

import { describe, it, expect, vi } from "vitest";
import { ImpactMetricService } from "../../src/application/impact-metric-service.js";

describe("ImpactMetricService", () => {
  it("compute returns ImpactMetric from provider snapshot", async () => {
    const mockProvider = {
      getImpactData: vi.fn().mockResolvedValue({
        artifactViews: 100,
        portfolioGrowth: 50,
        contributionActivity: 12,
      }),
    };
    const service = new ImpactMetricService(mockProvider);

    const result = await service.compute("sp-1");

    expect(result.sponsorshipId).toBe("sp-1");
    expect(result.artifactViews).toBe(100);
    expect(result.portfolioGrowth).toBe(50);
    expect(result.contributionActivity).toBe(12);
    expect(mockProvider.getImpactData).toHaveBeenCalledWith("sp-1");
  });

  it("compute returns zeros when provider returns zero snapshot", async () => {
    const mockProvider = {
      getImpactData: vi.fn().mockResolvedValue({
        artifactViews: 0,
        portfolioGrowth: 0,
        contributionActivity: 0,
      }),
    };
    const service = new ImpactMetricService(mockProvider);

    const result = await service.compute("sp-new");

    expect(result.sponsorshipId).toBe("sp-new");
    expect(result.artifactViews).toBe(0);
    expect(result.portfolioGrowth).toBe(0);
    expect(result.contributionActivity).toBe(0);
  });

  it("compute propagates provider errors", async () => {
    const mockProvider = {
      getImpactData: vi.fn().mockRejectedValue(new Error("Provider unavailable")),
    };
    const service = new ImpactMetricService(mockProvider);

    await expect(service.compute("sp-1")).rejects.toThrow("Provider unavailable");
  });
});
