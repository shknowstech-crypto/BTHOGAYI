import { supabase } from './supabase'
import { Report } from './supabase'

export class ReportService {
  // Create a report
  static async createReport(
    reporterId: string,
    reportedUserId: string,
    reportType: Report['report_type'],
    description: string = '',
    evidenceUrls: string[] = []
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: reporterId,
          reported_user_id: reportedUserId,
          report_type: reportType,
          description,
          evidence_urls: evidenceUrls,
          status: 'pending'
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error creating report:', error)
      return false
    }
  }

  // Get user's reports
  static async getUserReports(userId: string): Promise<Report[]> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reported_user:users!reports_reported_user_id_fkey(display_name, username)
        `)
        .eq('reporter_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting user reports:', error)
      return []
    }
  }

  // Check if user has already reported someone
  static async hasUserReported(reporterId: string, reportedUserId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('id')
        .eq('reporter_id', reporterId)
        .eq('reported_user_id', reportedUserId)
        .single()

      if (error) return false
      return !!data
    } catch (error) {
      return false
    }
  }

  // Get report statistics
  static async getReportStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('status, report_type')
        .eq('reporter_id', userId)

      if (error) throw error

      const reports = data || []
      return {
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        investigating: reports.filter(r => r.status === 'investigating').length,
        resolved: reports.filter(r => r.status === 'resolved').length,
        dismissed: reports.filter(r => r.status === 'dismissed').length,
        byType: {
          harassment: reports.filter(r => r.report_type === 'harassment').length,
          spam: reports.filter(r => r.report_type === 'spam').length,
          fake_profile: reports.filter(r => r.report_type === 'fake_profile').length,
          inappropriate_content: reports.filter(r => r.report_type === 'inappropriate_content').length,
          other: reports.filter(r => r.report_type === 'other').length
        }
      }
    } catch (error) {
      console.error('Error getting report stats:', error)
      return {
        total: 0,
        pending: 0,
        investigating: 0,
        resolved: 0,
        dismissed: 0,
        byType: {
          harassment: 0,
          spam: 0,
          fake_profile: 0,
          inappropriate_content: 0,
          other: 0
        }
      }
    }
  }
}