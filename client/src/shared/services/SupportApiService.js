import { apiRequest } from '@/lib/queryClient';

/**
 * Comprehensive Support Service API Integration
 * Amazon.com/Shopee.sg-level customer support functionality with complete backend synchronization
 */
export class SupportApiService {
  constructor() {
    this.baseUrl = '/api/v1/support';
  }

  // ================================
  // TICKET MANAGEMENT
  // ================================

  /**
   * Get support tickets overview
   */
  async getTicketsOverview(filters = {}) {
    const params = new URLSearchParams({
      status: filters.status || '',
      priority: filters.priority || '',
      category: filters.category || '',
      assignedTo: filters.assignedTo || '',
      customerId: filters.customerId || '',
      page: filters.page || '1',
      limit: filters.limit || '20',
      sortBy: filters.sortBy || 'createdAt',
      sortOrder: filters.sortOrder || 'desc',
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/tickets?${params}`);
  }

  /**
   * Create support ticket
   */
  async createTicket(ticketData) {
    return await apiRequest(`${this.baseUrl}/tickets`, {
      method: 'POST',
      body: JSON.stringify(ticketData)
    });
  }

  /**
   * Get ticket details
   */
  async getTicket(ticketId) {
    return await apiRequest(`${this.baseUrl}/tickets/${ticketId}`);
  }

  /**
   * Update ticket
   */
  async updateTicket(ticketId, updateData) {
    return await apiRequest(`${this.baseUrl}/tickets/${ticketId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  /**
   * Close ticket
   */
  async closeTicket(ticketId, resolution, feedback = '') {
    return await apiRequest(`${this.baseUrl}/tickets/${ticketId}/close`, {
      method: 'POST',
      body: JSON.stringify({ resolution, feedback })
    });
  }

  /**
   * Reopen ticket
   */
  async reopenTicket(ticketId, reason) {
    return await apiRequest(`${this.baseUrl}/tickets/${ticketId}/reopen`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  /**
   * Assign ticket to agent
   */
  async assignTicket(ticketId, agentId, notes = '') {
    return await apiRequest(`${this.baseUrl}/tickets/${ticketId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ agentId, notes })
    });
  }

  /**
   * Escalate ticket
   */
  async escalateTicket(ticketId, escalationLevel, reason) {
    return await apiRequest(`${this.baseUrl}/tickets/${ticketId}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ escalationLevel, reason })
    });
  }

  // ================================
  // CONVERSATION MANAGEMENT
  // ================================

  /**
   * Get ticket conversation
   */
  async getTicketConversation(ticketId) {
    return await apiRequest(`${this.baseUrl}/tickets/${ticketId}/conversation`);
  }

  /**
   * Add message to ticket
   */
  async addTicketMessage(ticketId, messageData) {
    return await apiRequest(`${this.baseUrl}/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  }

  /**
   * Add internal note to ticket
   */
  async addInternalNote(ticketId, note, agentId) {
    return await apiRequest(`${this.baseUrl}/tickets/${ticketId}/internal-notes`, {
      method: 'POST',
      body: JSON.stringify({ note, agentId })
    });
  }

  /**
   * Upload attachment to ticket
   */
  async uploadTicketAttachment(ticketId, file, description = '') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);

    return await apiRequest(`${this.baseUrl}/tickets/${ticketId}/attachments`, {
      method: 'POST',
      body: formData,
      headers: {} // Remove content-type to let browser set it with boundary
    });
  }

  // ================================
  // LIVE CHAT
  // ================================

  /**
   * Start live chat session
   */
  async startLiveChatSession(customerData) {
    return await apiRequest(`${this.baseUrl}/live-chat/start`, {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
  }

  /**
   * Join live chat session
   */
  async joinLiveChatSession(sessionId, agentId) {
    return await apiRequest(`${this.baseUrl}/live-chat/sessions/${sessionId}/join`, {
      method: 'POST',
      body: JSON.stringify({ agentId })
    });
  }

  /**
   * Send live chat message
   */
  async sendLiveChatMessage(sessionId, messageData) {
    return await apiRequest(`${this.baseUrl}/live-chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  }

  /**
   * End live chat session
   */
  async endLiveChatSession(sessionId, reason = '', satisfaction = null) {
    return await apiRequest(`${this.baseUrl}/live-chat/sessions/${sessionId}/end`, {
      method: 'POST',
      body: JSON.stringify({ reason, satisfaction })
    });
  }

  /**
   * Get live chat history
   */
  async getLiveChatHistory(sessionId) {
    return await apiRequest(`${this.baseUrl}/live-chat/sessions/${sessionId}/history`);
  }

  /**
   * Get active live chat sessions
   */
  async getActiveLiveChatSessions(agentId = '') {
    const params = new URLSearchParams({
      agentId
    });

    return await apiRequest(`${this.baseUrl}/live-chat/sessions/active?${params}`);
  }

  // ================================
  // KNOWLEDGE BASE
  // ================================

  /**
   * Get knowledge base articles
   */
  async getKnowledgeBaseArticles(filters = {}) {
    const params = new URLSearchParams({
      category: filters.category || '',
      tags: filters.tags || '',
      search: filters.search || '',
      language: filters.language || 'en',
      published: filters.published || 'true',
      page: filters.page || '1',
      limit: filters.limit || '20'
    });

    return await apiRequest(`${this.baseUrl}/knowledge-base/articles?${params}`);
  }

  /**
   * Get knowledge base article
   */
  async getKnowledgeBaseArticle(articleId) {
    return await apiRequest(`${this.baseUrl}/knowledge-base/articles/${articleId}`);
  }

  /**
   * Create knowledge base article
   */
  async createKnowledgeBaseArticle(articleData) {
    return await apiRequest(`${this.baseUrl}/knowledge-base/articles`, {
      method: 'POST',
      body: JSON.stringify(articleData)
    });
  }

  /**
   * Update knowledge base article
   */
  async updateKnowledgeBaseArticle(articleId, updateData) {
    return await apiRequest(`${this.baseUrl}/knowledge-base/articles/${articleId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  /**
   * Search knowledge base
   */
  async searchKnowledgeBase(query, language = 'en') {
    return await apiRequest(`${this.baseUrl}/knowledge-base/search`, {
      method: 'POST',
      body: JSON.stringify({ query, language })
    });
  }

  /**
   * Get knowledge base categories
   */
  async getKnowledgeBaseCategories() {
    return await apiRequest(`${this.baseUrl}/knowledge-base/categories`);
  }

  /**
   * Rate knowledge base article
   */
  async rateKnowledgeBaseArticle(articleId, rating, feedback = '') {
    return await apiRequest(`${this.baseUrl}/knowledge-base/articles/${articleId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, feedback })
    });
  }

  // ================================
  // FAQ MANAGEMENT
  // ================================

  /**
   * Get FAQ items
   */
  async getFAQItems(category = '', language = 'en') {
    const params = new URLSearchParams({
      category,
      language
    });

    return await apiRequest(`${this.baseUrl}/faq?${params}`);
  }

  /**
   * Create FAQ item
   */
  async createFAQItem(faqData) {
    return await apiRequest(`${this.baseUrl}/faq`, {
      method: 'POST',
      body: JSON.stringify(faqData)
    });
  }

  /**
   * Update FAQ item
   */
  async updateFAQItem(faqId, updateData) {
    return await apiRequest(`${this.baseUrl}/faq/${faqId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  /**
   * Search FAQ
   */
  async searchFAQ(query, language = 'en') {
    return await apiRequest(`${this.baseUrl}/faq/search`, {
      method: 'POST',
      body: JSON.stringify({ query, language })
    });
  }

  // ================================
  // AGENT MANAGEMENT
  // ================================

  /**
   * Get support agents
   */
  async getSupportAgents(filters = {}) {
    const params = new URLSearchParams({
      status: filters.status || '',
      department: filters.department || '',
      skills: filters.skills || '',
      availability: filters.availability || ''
    });

    return await apiRequest(`${this.baseUrl}/agents?${params}`);
  }

  /**
   * Get agent performance
   */
  async getAgentPerformance(agentId, period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/agents/${agentId}/performance?${params}`);
  }

  /**
   * Update agent status
   */
  async updateAgentStatus(agentId, status, message = '') {
    return await apiRequest(`${this.baseUrl}/agents/${agentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, message })
    });
  }

  /**
   * Get agent workload
   */
  async getAgentWorkload(agentId) {
    return await apiRequest(`${this.baseUrl}/agents/${agentId}/workload`);
  }

  // ================================
  // SUPPORT ANALYTICS
  // ================================

  /**
   * Get support analytics dashboard
   */
  async getSupportAnalytics(period = '30d', filters = {}) {
    const params = new URLSearchParams({
      period,
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/analytics/dashboard?${params}`);
  }

  /**
   * Get ticket resolution metrics
   */
  async getTicketResolutionMetrics(period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/analytics/ticket-resolution?${params}`);
  }

  /**
   * Get customer satisfaction metrics
   */
  async getCustomerSatisfactionMetrics(period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/analytics/customer-satisfaction?${params}`);
  }

  /**
   * Get support volume trends
   */
  async getSupportVolumeTrends(period = '30d', breakdown = 'daily') {
    const params = new URLSearchParams({
      period,
      breakdown // 'hourly', 'daily', 'weekly'
    });

    return await apiRequest(`${this.baseUrl}/analytics/volume-trends?${params}`);
  }

  // ================================
  // BANGLADESH-SPECIFIC SUPPORT
  // ================================

  /**
   * Get Bangladesh support categories
   */
  async getBangladeshSupportCategories() {
    return await apiRequest(`${this.baseUrl}/bangladesh/categories`);
  }

  /**
   * Create Bangladesh-specific ticket
   */
  async createBangladeshTicket(ticketData) {
    return await apiRequest(`${this.baseUrl}/bangladesh/tickets`, {
      method: 'POST',
      body: JSON.stringify({ ...ticketData, country: 'BD' })
    });
  }

  /**
   * Get Bengali support content
   */
  async getBengaliSupportContent(type = '') {
    const params = new URLSearchParams({
      type, // 'payment', 'shipping', 'returns', 'general'
      language: 'bn'
    });

    return await apiRequest(`${this.baseUrl}/bangladesh/content?${params}`);
  }

  /**
   * Get mobile banking support
   */
  async getMobileBankingSupport(provider = '') {
    const params = new URLSearchParams({
      provider // 'bkash', 'nagad', 'rocket'
    });

    return await apiRequest(`${this.baseUrl}/bangladesh/mobile-banking-support?${params}`);
  }

  // ================================
  // AUTOMATION & WORKFLOWS
  // ================================

  /**
   * Create support automation rule
   */
  async createAutomationRule(ruleData) {
    return await apiRequest(`${this.baseUrl}/automation/rules`, {
      method: 'POST',
      body: JSON.stringify(ruleData)
    });
  }

  /**
   * Get support workflows
   */
  async getSupportWorkflows() {
    return await apiRequest(`${this.baseUrl}/automation/workflows`);
  }

  /**
   * Trigger support workflow
   */
  async triggerSupportWorkflow(workflowId, ticketId, data = {}) {
    return await apiRequest(`${this.baseUrl}/automation/workflows/${workflowId}/trigger`, {
      method: 'POST',
      body: JSON.stringify({ ticketId, data })
    });
  }

  // ================================
  // CUSTOMER FEEDBACK
  // ================================

  /**
   * Submit customer feedback
   */
  async submitCustomerFeedback(feedbackData) {
    return await apiRequest(`${this.baseUrl}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedbackData)
    });
  }

  /**
   * Get customer feedback
   */
  async getCustomerFeedback(filters = {}) {
    const params = new URLSearchParams({
      rating: filters.rating || '',
      category: filters.category || '',
      startDate: filters.startDate || '',
      endDate: filters.endDate || '',
      page: filters.page || '1',
      limit: filters.limit || '20'
    });

    return await apiRequest(`${this.baseUrl}/feedback?${params}`);
  }

  /**
   * Respond to customer feedback
   */
  async respondToFeedback(feedbackId, response, agentId) {
    return await apiRequest(`${this.baseUrl}/feedback/${feedbackId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response, agentId })
    });
  }

  // ================================
  // SLA MANAGEMENT
  // ================================

  /**
   * Get SLA metrics
   */
  async getSLAMetrics(period = '30d') {
    const params = new URLSearchParams({
      period
    });

    return await apiRequest(`${this.baseUrl}/sla/metrics?${params}`);
  }

  /**
   * Get tickets breaching SLA
   */
  async getTicketsBreachingSLA() {
    return await apiRequest(`${this.baseUrl}/sla/breaches`);
  }

  /**
   * Update SLA settings
   */
  async updateSLASettings(slaData) {
    return await apiRequest(`${this.baseUrl}/sla/settings`, {
      method: 'PUT',
      body: JSON.stringify(slaData)
    });
  }

  // ================================
  // REAL-TIME FEATURES
  // ================================

  /**
   * Get real-time support metrics
   */
  async getRealTimeSupportMetrics() {
    return await apiRequest(`${this.baseUrl}/real-time/metrics`);
  }

  /**
   * Subscribe to support notifications
   */
  subscribeToSupportNotifications(onNotification, filters = {}) {
    const wsUrl = `ws://${window.location.host}/api/v1/support/notifications/subscribe`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', filters }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onNotification(data);
    };
    
    return ws;
  }

  /**
   * Subscribe to live chat updates
   */
  subscribeToLiveChatUpdates(sessionId, onUpdate) {
    const wsUrl = `ws://${window.location.host}/api/v1/support/live-chat/${sessionId}/subscribe`;
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };
    
    return ws;
  }

  // ================================
  // EXPORT & REPORTING
  // ================================

  /**
   * Export support data
   */
  async exportSupportData(exportType, filters = {}) {
    const params = new URLSearchParams({
      type: exportType, // 'tickets', 'conversations', 'analytics', 'feedback'
      format: filters.format || 'csv',
      ...filters
    });

    return await apiRequest(`${this.baseUrl}/export?${params}`, {
      responseType: 'blob'
    });
  }

  /**
   * Generate support report
   */
  async generateSupportReport(reportType, period, filters = {}) {
    return await apiRequest(`${this.baseUrl}/reports/generate`, {
      method: 'POST',
      body: JSON.stringify({ reportType, period, ...filters })
    });
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Get support ticket priority color
   */
  getPriorityColor(priority) {
    const colors = {
      'low': '#10B981',
      'medium': '#F59E0B', 
      'high': '#EF4444',
      'urgent': '#DC2626',
      'critical': '#7C2D12'
    };
    return colors[priority.toLowerCase()] || '#6B7280';
  }

  /**
   * Get support ticket status color
   */
  getStatusColor(status) {
    const colors = {
      'open': '#3B82F6',
      'in_progress': '#F59E0B',
      'waiting_customer': '#8B5CF6',
      'waiting_agent': '#06B6D4',
      'resolved': '#10B981',
      'closed': '#6B7280'
    };
    return colors[status.toLowerCase()] || '#6B7280';
  }

  /**
   * Format support metrics
   */
  formatSupportMetrics(metrics) {
    return {
      ...metrics,
      formattedResolutionTime: this.formatDuration(metrics.avgResolutionTime),
      formattedResponseTime: this.formatDuration(metrics.avgResponseTime),
      formattedSatisfactionRate: `${(metrics.satisfactionRate || 0).toFixed(1)}%`,
      formattedResolutionRate: `${(metrics.resolutionRate || 0).toFixed(1)}%`
    };
  }

  /**
   * Format duration in human readable format
   */
  formatDuration(minutes) {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } else {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    }
  }

  /**
   * Handle API errors with proper support context
   */
  handleError(error, operation) {
    console.error(`Support API Error - ${operation}:`, error);
    
    const errorResponse = {
      success: false,
      error: error.message || 'An unexpected support error occurred',
      operation,
      timestamp: new Date().toISOString(),
    };

    if (error.status === 401) {
      errorResponse.error = 'Support authentication required. Please log in.';
    } else if (error.status === 403) {
      errorResponse.error = 'You do not have permission to perform this support operation.';
    } else if (error.status === 404) {
      errorResponse.error = 'The requested support resource was not found.';
    } else if (error.status === 409) {
      errorResponse.error = 'Support ticket conflict. Please refresh and try again.';
    } else if (error.status === 422) {
      errorResponse.error = 'Invalid support data. Please check your input.';
    } else if (error.status === 429) {
      errorResponse.error = 'Too many support requests. Please try again later.';
    } else if (error.status >= 500) {
      errorResponse.error = 'Support server error. Please try again later.';
    }

    return errorResponse;
  }
}

// Export singleton instance
export const supportApiService = new SupportApiService();