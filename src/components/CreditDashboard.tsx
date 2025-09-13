import React, { useState, useEffect } from 'react';
import { useCreditScore } from '../hooks/useCreditScore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Plus,
  RefreshCw,
  BarChart3,
  History,
  Settings
} from 'lucide-react';
import { cn } from '../utils/cn';

interface CreditDashboardProps {
  userAddress: string;
  className?: string;
}

export const CreditDashboard: React.FC<CreditDashboardProps> = ({ 
  userAddress, 
  className = '' 
}) => {
  const {
    creditProfile,
    creditScore,
    creditTier,
    creditColor,
    userLoans,
    creditEvents,
    loanStatistics,
    isLoading,
    isCreatingProfile,
    isCheckingEligibility,
    isCreatingLoan,
    isRecordingRepayment,
    error,
    createCreditProfile,
    getCreditProfile,
    checkLoanEligibility,
    createLoan,
    recordRepayment,
    recordDefault,
    getUserLoans,
    getCreditEvents,
    getLoanStatistics,
    refreshData,
    clearError
  } = useCreditScore();

  const [loanAmount, setLoanAmount] = useState('');
  const [loanDuration, setLoanDuration] = useState('30');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);

  useEffect(() => {
    if (userAddress) {
      refreshData(userAddress);
    }
  }, [userAddress, refreshData]);

  const handleCreateProfile = async () => {
    try {
      await createCreditProfile(userAddress);
    } catch (error) {
      console.error('Failed to create profile:', error);
    }
  };

  const handleCheckEligibility = async () => {
    if (!loanAmount) return;
    
    try {
      const result = await checkLoanEligibility(userAddress, loanAmount);
      setEligibilityResult(result);
    } catch (error) {
      console.error('Failed to check eligibility:', error);
    }
  };

  const handleCreateLoan = async () => {
    if (!loanAmount || !loanDuration || !loanPurpose) return;
    
    try {
      const loanId = await createLoan({
        userId: userAddress,
        amount: loanAmount,
        duration: parseInt(loanDuration) * 24 * 60 * 60, // Convert days to seconds
        purpose: loanPurpose
      });
      
      // Reset form
      setLoanAmount('');
      setLoanDuration('30');
      setLoanPurpose('');
      setEligibilityResult(null);
      
      alert(`Loan created successfully! Loan ID: ${loanId}`);
    } catch (error) {
      console.error('Failed to create loan:', error);
    }
  };

  const handleRecordRepayment = async () => {
    if (!selectedLoanId || !repaymentAmount) return;
    
    try {
      await recordRepayment(selectedLoanId, repaymentAmount);
      setRepaymentAmount('');
      setSelectedLoanId(null);
      alert('Repayment recorded successfully!');
    } catch (error) {
      console.error('Failed to record repayment:', error);
    }
  };

  const handleRecordDefault = async (loanId: number) => {
    if (!confirm('Are you sure you want to mark this loan as defaulted?')) return;
    
    try {
      await recordDefault(loanId);
      alert('Loan marked as defaulted');
    } catch (error) {
      console.error('Failed to record default:', error);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getScoreProgress = (score: number) => {
    return (score / 1000) * 100;
  };

  const getScoreColor = (score: number) => {
    if (score >= 800) return 'text-green-600';
    if (score >= 700) return 'text-blue-600';
    if (score >= 600) return 'text-yellow-600';
    if (score >= 500) return 'text-orange-600';
    return 'text-red-600';
  };

  if (isLoading && !creditProfile) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading credit data...</span>
      </div>
    );
  }

  if (!creditProfile) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Credit Profile Setup
          </CardTitle>
          <CardDescription>
            Create your credit profile to start borrowing and building your credit score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You don't have a credit profile yet. Create one to start using our lending services.
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={handleCreateProfile}
            disabled={isCreatingProfile}
            className="mt-4"
          >
            {isCreatingProfile ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Creating Profile...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Credit Profile
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearError}
              className="ml-2"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Credit Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Credit Score Overview
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refreshData(userAddress)}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Credit Score */}
            <div className="text-center">
              <div className={cn("text-4xl font-bold mb-2", getScoreColor(creditScore || 0))}>
                {creditScore}
              </div>
              <Badge className={cn("mb-4", creditColor)}>
                {creditTier}
              </Badge>
              <Progress 
                value={getScoreProgress(creditScore || 0)} 
                className="h-2"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Score Range: 0-1000
              </p>
            </div>

            {/* Payment History */}
            <div className="space-y-2">
              <h4 className="font-semibold">Payment History</h4>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">On-time: {creditProfile.onTimePayments}</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm">Late: {creditProfile.latePayments}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Active Loans: {creditProfile.activeLoans}</span>
              </div>
            </div>

            {/* Loan Statistics */}
            <div className="space-y-2">
              <h4 className="font-semibold">Loan Statistics</h4>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm">Total Borrowed: {formatCurrency(creditProfile.totalBorrowed)}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Total Repaid: {formatCurrency(creditProfile.totalRepaid)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Completed: {creditProfile.completedLoans}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="loans" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="loans">My Loans</TabsTrigger>
          <TabsTrigger value="apply">Apply for Loan</TabsTrigger>
          <TabsTrigger value="repay">Make Payment</TabsTrigger>
          <TabsTrigger value="history">Credit History</TabsTrigger>
        </TabsList>

        {/* My Loans Tab */}
        <TabsContent value="loans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                My Loans
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userLoans.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No loans found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userLoans.map((loan) => (
                    <Card key={loan.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">Loan #{loan.id}</h4>
                            <p className="text-sm text-muted-foreground">{loan.purpose}</p>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm">
                                <span className="font-medium">Amount:</span> {formatCurrency(loan.amount)}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Interest Rate:</span> {(loan.interestRate / 100).toFixed(2)}%
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Due Date:</span> {formatDate(loan.dueDate)}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Repaid:</span> {formatCurrency(loan.amountRepaid)}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge variant={loan.isActive ? "default" : "secondary"}>
                              {loan.isActive ? "Active" : "Completed"}
                            </Badge>
                            {loan.isDefaulted && (
                              <Badge variant="destructive">Defaulted</Badge>
                            )}
                            {loan.isActive && (
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleRecordDefault(loan.id)}
                              >
                                Mark Default
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Apply for Loan Tab */}
        <TabsContent value="apply" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Apply for Loan
              </CardTitle>
              <CardDescription>
                Apply for a loan based on your credit score
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Loan Amount (USD)</label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Duration (Days)</label>
                  <Input
                    type="number"
                    placeholder="Enter duration"
                    value={loanDuration}
                    onChange={(e) => setLoanDuration(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Purpose</label>
                <Input
                  placeholder="Enter loan purpose"
                  value={loanPurpose}
                  onChange={(e) => setLoanPurpose(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleCheckEligibility}
                  disabled={!loanAmount || isCheckingEligibility}
                  variant="outline"
                >
                  {isCheckingEligibility ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Checking...
                    </>
                  ) : (
                    'Check Eligibility'
                  )}
                </Button>
                
                <Button 
                  onClick={handleCreateLoan}
                  disabled={!loanAmount || !loanDuration || !loanPurpose || isCreatingLoan}
                >
                  {isCreatingLoan ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Apply for Loan'
                  )}
                </Button>
              </div>

              {eligibilityResult && (
                <Alert className={eligibilityResult.eligible ? "border-green-500" : "border-red-500"}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {eligibilityResult.eligible ? (
                      <div>
                        <p className="font-semibold text-green-600">Eligible for loan!</p>
                        <p>Recommended amount: {formatCurrency(eligibilityResult.recommendedAmount)}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-red-600">Not eligible for this loan amount</p>
                        <p>Recommended amount: {formatCurrency(eligibilityResult.recommendedAmount)}</p>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Make Payment Tab */}
        <TabsContent value="repay" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Make Payment
              </CardTitle>
              <CardDescription>
                Record a loan repayment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Loan</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={selectedLoanId || ''}
                  onChange={(e) => setSelectedLoanId(parseInt(e.target.value))}
                >
                  <option value="">Select a loan</option>
                  {userLoans.filter(loan => loan.isActive).map((loan) => (
                    <option key={loan.id} value={loan.id}>
                      Loan #{loan.id} - {formatCurrency(loan.amount)} ({loan.purpose})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Payment Amount (USD)</label>
                <Input
                  type="number"
                  placeholder="Enter payment amount"
                  value={repaymentAmount}
                  onChange={(e) => setRepaymentAmount(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleRecordRepayment}
                disabled={!selectedLoanId || !repaymentAmount || isRecordingRepayment}
              >
                {isRecordingRepayment ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Recording...
                  </>
                ) : (
                  'Record Payment'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credit History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Credit History
              </CardTitle>
              <CardDescription>
                Your credit events and transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {creditEvents.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No credit events found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {creditEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          event.type === 'loan_created' && "bg-blue-500",
                          event.type === 'loan_repaid' && "bg-green-500",
                          event.type === 'loan_defaulted' && "bg-red-500",
                          event.type === 'score_updated' && "bg-purple-500",
                          event.type === 'profile_created' && "bg-gray-500"
                        )} />
                        <div>
                          <p className="font-medium">{event.reason}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {event.amount && (
                          <p className="font-medium">{formatCurrency(event.amount)}</p>
                        )}
                        {event.score && (
                          <p className="text-sm text-muted-foreground">Score: {event.score}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreditDashboard;
