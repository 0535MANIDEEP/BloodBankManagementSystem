/**
 * @fileoverview Service encapsulating donor eligibility rules and AI suggestion logic.
 * 
 * Demonstrates OOP Principle: Abstraction & Separation of Concerns.
 */

'use strict';

class EligibilityService {
  /**
   * Helper to calculate calendar days between two dates.
   * @param {Date} date1 
   * @param {Date} date2 
   * @returns {number}
   */
  static getDaysBetween(date1, date2) {
    const diffTime = Math.abs(date2 - date1);
    return Math.ceil(diffTime / (1024 * 60 * 60 * 24));
  }

  /**
   * Evaluates if a donor is eligible to donate based on standard physical criteria
   * and previous donation intervals, returning eligibility stats and custom AI suggestions.
   * 
   * @param {object} donor - The Mongoose User document representing the donor.
   * @returns {object} Eligibility assessment results.
   */
  static check(donor) {
    if (donor.isBanned) {
      return {
        isEligible: false,
        reason: 'Account is locked/banned.',
        daysUntilEligible: 999,
        aiSuggestion: 'Please contact the system administrator to resolve account constraints.'
      };
    }

    // Age Check (18 - 65)
    if (!donor.age || donor.age < 18 || donor.age > 65) {
      return {
        isEligible: false,
        reason: 'Age requirements: must be between 18 and 65 years.',
        daysUntilEligible: 0,
        aiSuggestion: 'Blood donation is medically restricted to ages 18-65 for safety.'
      };
    }

    // Weight Check (min 50kg)
    if (!donor.weight || donor.weight < 50) {
      return {
        isEligible: false,
        reason: 'Weight requirements: must be at least 50 kg.',
        daysUntilEligible: 0,
        aiSuggestion: 'Weight limits protect donors from hypovolemic events. Standard minimum is 50 kg.'
      };
    }

    // Chronic Illness Health Conditions Check
    const criticalConditions = ['hiv', 'hepatitis', 'cancer', 'diabetes (insulin)', 'diabetes'];
    const matchingConditions = (donor.healthConditions || []).filter(cond => 
      criticalConditions.includes(cond.toLowerCase())
    );

    if (matchingConditions.length > 0) {
      return {
        isEligible: false,
        reason: `Critical health conditions detected: ${matchingConditions.join(', ')}.`,
        daysUntilEligible: 999,
        aiSuggestion: 'Medical guidelines prohibit donations from individuals with chronic illnesses to protect recipients.'
      };
    }

    // Last Donation Date Check (Minimum 90 days interval for whole blood)
    if (donor.lastDonationDate) {
      const lastDate = new Date(donor.lastDonationDate);
      const today = new Date();
      const daysSinceLast = this.getDaysBetween(lastDate, today);

      if (daysSinceLast < 90) {
        const daysRemaining = 90 - daysSinceLast;
        const targetDate = new Date();
        targetDate.setDate(today.getDate() + daysRemaining);
        
        const dateString = targetDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

        return {
          isEligible: false,
          reason: `Last donation was ${daysSinceLast} days ago. Wait period is 90 days.`,
          daysUntilEligible: daysRemaining,
          aiSuggestion: `Smart AI Suggestion: You are eligible to donate in ${daysRemaining} days (around ${dateString}). Ensure you stay hydrated!`
        };
      }
    }

    // Profile completeness check
    let profileCompMeter = 100;
    if (!donor.phone || !donor.weight || !donor.age) {
      profileCompMeter = 70;
    }

    return {
      isEligible: true,
      reason: 'Meets all eligibility criteria.',
      daysUntilEligible: 0,
      aiSuggestion: 'Smart AI Suggestion: You are currently eligible to donate blood! Make sure to eat a light meal and drink plenty of fluids prior to your donation.'
    };
  }
}

module.exports = EligibilityService;
