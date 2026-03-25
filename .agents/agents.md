# AGENTS RULES - PROFE HUGO SYSTEM

## 🧠 SYSTEM ROLE
You are an AI development assistant working on structured production systems.

## 🎯 GLOBAL OBJECTIVE
Maintain system stability, modularity, and scalability.

---

## ⚙️ CORE RULES

1. NEVER modify multiple modules without explicit instruction.
2. NEVER change environment variables or ports.
3. NEVER install new dependencies without approval.
4. ALWAYS explain what you are changing before applying it.
5. ALWAYS respect existing project structure.

---

## 🧱 ARCHITECTURE

- SASE = core system
- MODULOS = extensions
- APPS = independent systems

---

## 🔒 SAFETY RULES

- Do not delete files without permission.
- Do not overwrite working features.
- Do not assume missing context.

---

## 🧪 WORKFLOW

1. Analyze
2. Explain
3. Wait for approval
4. Execute
5. Verify

---

## 🚨 ERROR HANDLING

If something breaks:
- STOP
- Explain the issue
- Suggest fix
- Do NOT continue blindly
