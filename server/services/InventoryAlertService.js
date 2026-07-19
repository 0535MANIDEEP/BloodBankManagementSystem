/**
 * @fileoverview Service analyzing blood inventory stock levels and generating AI warnings.
 * 
 * Demonstrates OOP Principle: Single Responsibility & Separation of Concerns.
 */

'use strict';

class InventoryAlertService {
  /**
   * Compiles inventory data, counts quantities of active blood groups, 
   * flags expired items, and creates smart warning tickets.
   * 
   * @param {Array} rawInventory - Detailed database documents from Inventory.
   * @returns {object} { summary, alerts }
   */
  static processStock(rawInventory) {
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    const stockSummary = {};
    bloodGroups.forEach(bg => {
      stockSummary[bg] = 0;
    });

    const today = new Date();
    
    // Sum active stocks (ignore expired / assigned)
    rawInventory.forEach(item => {
      if (item.status === 'available' && new Date(item.expiryDate) >= today) {
        stockSummary[item.bloodGroup] += item.units;
      }
    });

    // Generate alerts
    const alerts = [];
    const lowStockThreshold = 8;

    Object.keys(stockSummary).forEach(bg => {
      const units = stockSummary[bg];
      if (units === 0) {
        alerts.push({
          type: 'danger',
          bloodGroup: bg,
          message: `CRITICAL ALERT: ${bg} stock is completely empty! Please issue urgent donor outreach.`
        });
      } else if (units < lowStockThreshold) {
        alerts.push({
          type: 'warning',
          bloodGroup: bg,
          message: `ALERT: ${bg} stock is low (${units} units remaining). Consider requesting donor appointments.`
        });
      }
    });

    // Check for units expiring in the next 7 days
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const expiringSoonCount = rawInventory.filter(item => 
      item.status === 'available' &&
      new Date(item.expiryDate) >= today &&
      new Date(item.expiryDate) <= sevenDaysFromNow
    ).length;

    if (expiringSoonCount > 0) {
      alerts.push({
        type: 'info',
        message: `ALERT: ${expiringSoonCount} blood bags are expiring within the next 7 days. Prioritize matching for current requests.`
      });
    }

    return {
      summary: stockSummary,
      alerts
    };
  }
}

module.exports = InventoryAlertService;
