import { StatusBadge } from "@/components/ui/status-badge"
import {
  CheckCircle,
  XCircle,
  Shield,
  AlertCircle,
} from 'lucide-react'

export function StatusBadgeDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      <StatusBadge 
        leftIcon={Shield}
        rightIcon={CheckCircle}
        leftLabel="Protection"
        rightLabel="SSO login"
        status="success"
      />
      <StatusBadge 
        leftIcon={CheckCircle}
        rightIcon={AlertCircle}
        leftLabel="Live"
        rightLabel="Audit trails"
        status="success"
      />
      <StatusBadge 
        leftIcon={XCircle}
        rightIcon={Shield}
        leftLabel="Safety checks"
        rightLabel="Production"
        status="error"
      />
    </div>
  )
}
