"""Streamlit SRE Incident Investigation Console."""

import streamlit as st
import time
from ui.api_client import SREAPIClient

st.set_page_config(
    page_title="AI SRE Investigation Platform",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for modern SRE dashboard aesthetic
st.markdown("""
<style>
    .reportview-container {
        background-color: #0e1117;
    }
    .metric-card {
        background-color: #1e222d;
        border-radius: 8px;
        padding: 16px;
        border: 1px solid #2d3342;
        margin-bottom: 12px;
    }
    .citation-card {
        background-color: #1a1e29;
        border-left: 4px solid #4a88e8;
        padding: 12px 16px;
        margin-bottom: 10px;
        border-radius: 4px;
    }
    .badge-hybrid {
        background-color: #7928ca;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 0.85rem;
    }
    .badge-rag {
        background-color: #0070f3;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 0.85rem;
    }
    .badge-sql {
        background-color: #10b981;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 0.85rem;
    }
</style>
""", unsafe_allow_html=True)

if "api_client" not in st.session_state:
    st.session_state.api_client = SREAPIClient(base_url="http://localhost:8000")

client: SREAPIClient = st.session_state.api_client

# Sidebar - Auth & Configuration
with st.sidebar:
    st.title("🛡️ SRE Security Portal")
    st.markdown("---")

    if not client.token:
        st.subheader("Engineer Login")
        username = st.text_input("Username", value="sre_lead")
        password = st.text_input("Password", value="Password123!", type="password")

        if st.button("Authenticate", use_container_width=True, type="primary"):
            try:
                auth_data = client.login(username, password)
                st.success(f"Authenticated as **{auth_data['username']}** ({auth_data['role'].upper()})")
                st.rerun()
            except Exception as e:
                st.error(f"Login failed: {str(e)}")
    else:
        user = client.user_info
        st.success(f"👤 **{user['username']}**")
        st.info(f"Role: `{user['role'].upper()}` | Rate Limit: `20 req/min`")

        if st.button("Logout", use_container_width=True):
            client.token = None
            client.user_info = None
            st.rerun()

    st.markdown("---")
    st.markdown("### System Health Probes")
    st.markdown("- **API Gateway**: `v1.0.0 (FastAPI)`")
    st.markdown("- **Vector Store**: `Qdrant (Dense + BM25)`")
    st.markdown("- **Cache**: `5-Tier SHA-256 Engine`")
    st.markdown("- **Security Gate**: `L1-L9 Multi-layer`")

# Main Screen
st.title("Agentic RAG AI SRE Platform")
st.caption("Evidence-Grounded Incident Diagnostic & Operational Retrieval Console")

if not client.token:
    st.warning("🔒 Please sign in from the left sidebar to access live investigation telemetry.")
    st.stop()

# Investigation Panel
tab1, tab2, tab3 = st.tabs(["🔍 Incident Investigation", "📋 Audit & Compliance Trail", "📚 Knowledge Corpus"])

with tab1:
    col1, col2 = st.columns([3, 1])

    with col1:
        default_q = "Checkout latency has increased 3x since the last deployment --- what changed, and has this happened before?"
        query_input = st.text_area("Incident Investigation Inquiry:", value=default_q, height=100)

    with col2:
        service_filter = st.selectbox("Target Service Scope:", ["checkout-service", "auth-service", "payment-gateway", "All Services"])
        force_refresh = st.checkbox("Bypass Cache (Force Refresh)", value=False)
        investigate_btn = st.button("Run Diagnostic", type="primary", use_container_width=True)

    if investigate_btn and query_input:
        with st.spinner("Analyzing telemetry, hybrid retrieval index, and deployment diffs..."):
            try:
                selected_svc = None if service_filter == "All Services" else service_filter
                res = client.investigate(query_input, service_name=selected_svc, force_refresh=force_refresh)

                # Diagnostic Summary & Badges
                st.markdown("### 📊 Diagnostic Findings")
                
                badge_class = f"badge-{res['route'].lower()}"
                st.markdown(
                    f"**Route**: <span class='{badge_class}'>{res['route'].upper()}</span> &nbsp;&nbsp;|&nbsp;&nbsp; "
                    f"**Trace ID**: `{res['trace_id']}` &nbsp;&nbsp;|&nbsp;&nbsp; "
                    f"**Cache Hit**: `{res['cache_hit']}` &nbsp;&nbsp;|&nbsp;&nbsp; "
                    f"**Faithfulness Score**: `{res['faithfulness_score'] * 100:.0f}%`",
                    unsafe_allow_html=True
                )

                st.markdown(res["answer"])

                # Evidence & Citations Section
                st.markdown("### 📑 Verifiable Evidence & Citations")
                if res.get("evidence"):
                    for ev in res["evidence"]:
                        source_type = ev.get("source_type", "doc").upper()
                        score = ev.get("relevance_score", 1.0)
                        title = ev.get("title", "Evidence Source")
                        excerpt = ev.get("excerpt", "")

                        st.markdown(f"""
                        <div class="citation-card">
                            <strong>[{source_type}] {title}</strong> (Relevance: {score:.2f})<br/>
                            <small style="color: #a0aec0;">ID: <code>{ev.get('id')}</code></small><br/>
                            <p style="margin-top: 6px; font-family: monospace; font-size: 0.9rem;">{excerpt}</p>
                        </div>
                        """, unsafe_allow_html=True)
                else:
                    st.info("No explicit citations found for this inquiry.")

                # Recommended next checks
                if res.get("suggested_next_checks"):
                    st.markdown("### 🛠️ Recommended Next SRE Checks")
                    for check in res["suggested_next_checks"]:
                        st.markdown(f"- [ ] {check}")

            except Exception as e:
                st.error(f"Investigation request failed: {str(e)}")

with tab2:
    st.subheader("Immutable Audit & Security Trace Logs")
    if st.button("Refresh Audit Stream"):
        st.rerun()

    try:
        events = client.get_audit_events(limit=15)
        if events:
            for ev in events:
                with st.expander(f"🕒 {ev['timestamp']} | Event: {ev['event_type']} | Trace: {ev['trace_id']}"):
                    st.json(ev)
        else:
            st.info("No audit events recorded yet.")
    except Exception as e:
        st.error(f"Failed to fetch audit records: {str(e)}")

with tab3:
    st.subheader("Indexed Operational Knowledge Assets")
    st.markdown("""
    - **`RBK-CHK-001`**: Checkout Service High Latency & Redis Pool Exhaustion Runbook
    - **`PMM-2026-0504`**: Postmortem: Incident INC-2026-0504 - Checkout Latency & Connection Throttling
    - **Structured SQL Tables**: `users`, `services`, `incidents`, `deployments`, `clusters`, `pods`, `audit_events`
    """)
