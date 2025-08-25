@@ .. @@
-export function InviteFriendsModal({ isOpen, onClose }: InviteFriendsModalProps) {
+export function InviteFriendsModal() {
+  const { inviteModalOpen, setInviteModalOpen } = useAppStore()
   const [inviteCode, setInviteCode] = useState('')
   const [shareLink, setShareLink] = useState('')
   const [isLoading, setIsLoading] = useState(false)
   const [copied, setCopied] = useState(false)
-  const { user } = useAppStore()
+  const [emails, setEmails] = useState('')
+  const [invitesSent, setInvitesSent] = useState(0)
 
   const inviteLink = `${window.location.origin}?ref=invite`
@@ .. @@
   const copyInviteLink = async () => {
     try {
       await navigator.clipboard.writeText(inviteLink)
-      // You could add a toast notification here
+      setCopied(true)
+      setTimeout(() => setCopied(false), 2000)
     } catch (error) {
       console.error('Failed to copy link:', error)
     }
   }