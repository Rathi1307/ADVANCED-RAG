# Postmortem: Incident INC-2026-0504 - Checkout Latency & Connection Throttling

**Document ID**: `PMM-2026-0504`  
**Date**: `2026-05-04`  
**Severity**: `P1`  
**Affected Services**: `checkout-service`, `payment-gateway`  
**Lead Engineer**: `sre_lead`

## Executive Summary
On May 4, 2026, checkout-service experienced a 3.5x latency surge (from normal baseline of 170ms to 610ms) shortly after deployment DEP-2026-5412. The issue persisted for 42 minutes before being mitigated by rolling back the deployment.

## Root Cause Analysis (RCA)
A configuration change reduced the Redis client connection pool size from 50 to 5 (`REDIS_POOL_SIZE=5`). Under standard peak traffic, all available connections were exhausted within seconds, causing inbound checkout API threads to block waiting for connections until timing out (`ERR_REDIS_TIMEOUT`). Several pods subsequently failed Kubernetes health checks and triggered cascading restarts.

## Preventative Action Items
1. Added validation checks in CI/CD pipeline to block deployment if `REDIS_POOL_SIZE < 20`.
2. Updated runbook `RBK-CHK-001` with explicit SQL inspection queries for deployment diffs.
