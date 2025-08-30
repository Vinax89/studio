import { calculatePayrollTaxes, SOCIAL_SECURITY_WAGE_BASE } from '@/lib/taxes';

describe('calculatePayrollTaxes', () => {
  it('computes payroll taxes below the Social Security wage base', () => {
    const wages = 50_000;
    const payroll = calculatePayrollTaxes(wages, 'single');
    const expectedSocialSecurity = wages * 0.062;
    const expectedMedicare = wages * 0.0145;
    expect(payroll.socialSecurity).toBeCloseTo(expectedSocialSecurity, 2);
    expect(payroll.medicare).toBeCloseTo(expectedMedicare, 2);
    expect(payroll.additionalMedicare).toBe(0);
    expect(payroll.total).toBeCloseTo(expectedSocialSecurity + expectedMedicare, 2);
  });

  it('caps Social Security tax and applies additional Medicare surtax', () => {
    const wages = 250_000;
    const payroll = calculatePayrollTaxes(wages, 'single');
    const expectedSocialSecurity = SOCIAL_SECURITY_WAGE_BASE * 0.062;
    const expectedMedicare = wages * 0.0145;
    const expectedAdditional = (wages - 200_000) * 0.009;
    expect(payroll.socialSecurity).toBeCloseTo(expectedSocialSecurity, 2);
    expect(payroll.medicare).toBeCloseTo(expectedMedicare, 2);
    expect(payroll.additionalMedicare).toBeCloseTo(expectedAdditional, 2);
    expect(payroll.total).toBeCloseTo(
      expectedSocialSecurity + expectedMedicare + expectedAdditional,
      2,
    );
  });
});
