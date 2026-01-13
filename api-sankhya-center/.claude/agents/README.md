# Specialized Agents for API Sankhya Center

## 📋 Available Agents

### 1. TypeScript Pro (`typescript-pro`)
**Specialist in**: TypeScript 5.0+, advanced type systems, NestJS patterns

**When to use**:
- Implementing new NestJS services and controllers
- Designing type-safe DTOs and interfaces
- Optimizing TypeScript build performance
- Creating generic utilities and type guards
- Ensuring end-to-end type safety

**How to invoke**:
```
@typescript-pro help me implement the ProductService with full type safety
```

---

### 2. SQL Pro (`sql-pro`)
**Specialist in**: SQL Server optimization, query design, performance tuning

**When to use**:
- Writing complex SQL queries for Sankhya database
- Optimizing slow queries
- Designing efficient joins and aggregations
- Analyzing execution plans
- Creating analytics queries

**How to invoke**:
```
@sql-pro optimize this query for better performance: SELECT ...
```

---

### 3. API Documenter (`api-documenter`)
**Specialist in**: Swagger/OpenAPI 3.0, NestJS decorators, API documentation

**When to use**:
- Documenting controllers and endpoints
- Creating comprehensive Swagger documentation
- Writing DTOs with proper decorators
- Documenting error responses
- Creating code examples for API usage

**How to invoke**:
```
@api-documenter document this controller with full Swagger decorators
```

---

### 4. NestJS Expert (`nestjs-expert`)
**Specialist in**: NestJS framework, design patterns, best practices, scalability

**When to use**:
- Implementing NestJS modules and architecture
- Setting up guards, interceptors, pipes
- Dependency injection patterns
- Testing strategies (Jest)
- Performance optimization
- Error handling and exception filters

**How to invoke**:
```
@nestjs-expert help me structure this feature module with proper DI
```

---

## 🚀 Usage Examples

### Example 1: TypeScript Service Implementation

```
@typescript-pro I need to implement a ProductService that:
- Fetches products with full type safety
- Uses discriminated unions for error handling
- Has 100% type coverage
- Integrates with our SankhyaApiService
```

### Example 2: SQL Query Optimization

```
@sql-pro I have a slow query that retrieves product prices.
Can you optimize it using OUTER APPLY and window functions?
```

### Example 3: Combined Workflow

```
1. @sql-pro write a query to get product dashboard data with KPIs
2. @typescript-pro create TypeScript interfaces for the query results
3. @typescript-pro implement a service method that executes this query with full type safety
```

---

## 🎯 Agent Collaboration

Agents can work together for complex tasks:

```
User: I need a complete feature for product price analytics

Step 1: @sql-pro design optimized queries for:
- Last purchase price
- Average price (last 10 purchases)
- Price history over time

Step 2: @typescript-pro create:
- TypeScript interfaces for all results
- Service methods with type guards
- DTOs with validation
- Controller endpoints

Step 3: Test and integrate
```

---

## 📚 Agent Capabilities

### TypeScript Pro

**Can do**:
- ✅ Type-first API design
- ✅ Advanced TypeScript patterns
- ✅ Build optimization
- ✅ NestJS best practices
- ✅ Type guard implementation
- ✅ Generic utilities

**Cannot do**:
- ❌ Write SQL queries (use sql-pro)
- ❌ Database design (use sql-pro)
- ❌ Frontend-specific code (different agent needed)

### SQL Pro

**Can do**:
- ✅ Complex query optimization
- ✅ Execution plan analysis
- ✅ Index design
- ✅ Window functions and CTEs
- ✅ Performance tuning
- ✅ Data modeling

**Cannot do**:
- ❌ TypeScript implementation (use typescript-pro)
- ❌ API endpoint design (use typescript-pro)
- ❌ Frontend queries (different context)

---

## 🔧 Configuration

Agents are configured in:
```
.claude/agents/
├── typescript-pro.md    # TypeScript 5.0+ specialist
├── sql-pro.md           # SQL Server optimization specialist
├── api-documenter.md    # Swagger/OpenAPI documentation specialist
├── nestjs-expert.md     # NestJS framework specialist
└── README.md            # This file
```

Each agent has:
- **Identity & Expertise**: What they specialize in
- **Development Workflow**: Their process (Phase 1, 2, 3)
- **Technical Standards**: Quality requirements
- **Best Practices**: Patterns to follow/avoid
- **Collaboration Context**: How they work with other agents

---

## 📖 Related Documentation

- [DATABASE-INSPECTION-GUIDE.md](../docs/DATABASE-INSPECTION-GUIDE.md) - How to inspect Sankhya database
- [PRODUCTS-MODULE-COMPLETE.md](../docs/PRODUCTS-MODULE-COMPLETE.md) - Complete products module guide
- [INSPECTION-EXAMPLES.md](../docs/INSPECTION-EXAMPLES.md) - Practical examples

---

## 💡 Tips for Working with Agents

1. **Be specific**: Agents work best with clear, detailed requests
2. **Provide context**: Share relevant code, errors, or requirements
3. **Use sequentially**: Let one agent complete before invoking another
4. **Combine strengths**: Use sql-pro for queries, typescript-pro for implementation
5. **Review outputs**: Always review and test agent-generated code

---

**Last updated**: 2026-01-13
