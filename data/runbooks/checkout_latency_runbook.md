# Runbook: Checkout Service High Latency & Redis Pool Exhaustion

**Document ID**: `RBK-CHK-001`  
**Target Service**: `checkout-service`  
**Owning Team**: `payments-and-checkout`  
**Last Updated**: `2026-09-15`

## 1. Symptoms & Alerts
- Latency P99 spikes above SLO threshold (>200ms, frequently reaching 600ms - 1200ms).
- Pod logs show frequent `ERR_REDIS_TIMEOUT` or `ConnectionPoolExhaustedException`.
- Kubernetes pods may restart or enter `CrashLoopBackOff` due to readiness probe timeouts.

## 2. Common Root Causes
1. **Misconfigured Connection Pool**: `REDIS_POOL_SIZE` set below required concurrency (e.g. pool size reduced to 5 while pod handles 50 concurrent requests).
2. **Deployment Regression**: Recent deployment introducing aggressive unbatched cache writes or unindexed relational queries.
3. **Redis Node CPU Spikes**: Hot keys or expensive Lua scripts running on the Redis master node.

## 3. Step-by-Step Diagnostic & Triage Workflow
1. **Check Recent Deployments**: Run `SELECT * FROM deployments WHERE service_id = 'svc-checkout-001' ORDER BY deployed_at DESC LIMIT 2;` to inspect recent configuration changes and commit diffs.
2. **Check Pod Health**: Inspect pod status and restart counts for `checkout-service` pods. Look for `ERR_REDIS_TIMEOUT` or `OOMKilled` error codes.
3. **Inspect Connection Pool Settings**: Verify if `REDIS_POOL_SIZE` was reduced in the last deployment config diff.
4. **Compare With Previous Incidents**: Check postmortems for similar symptoms (e.g., `INC-2026-0812`).

## 4. Immediate Remediation Actions
- **Rollback Deployment**: If latency surged immediately following a deployment (e.g. `DEP-2026-9901`), initiate rollback to previous stable commit.
- **Scale Pod Replicas**: Temporarily increase replica count to distribute connection load across pods.
- **Increase Pool Size**: Set `REDIS_POOL_SIZE=50` and redeploy.
