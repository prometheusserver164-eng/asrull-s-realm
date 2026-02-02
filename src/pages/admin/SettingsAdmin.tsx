import { motion } from "framer-motion";
import { Shield, Info } from "lucide-react";

export default function SettingsAdmin() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Settings
        </h1>
        <p className="text-foreground-secondary">
          Additional settings and configurations.
        </p>
      </motion.div>

      {/* Admin Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card-elevated p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              Admin Access
            </h2>
            <p className="text-foreground-secondary mb-4">
              To grant admin access to a user, you'll need to add their user ID to the
              user_roles table in your database with the 'admin' role.
            </p>
            <div className="p-4 rounded-lg bg-background border border-border font-mono text-sm text-foreground-secondary">
              <pre>{`INSERT INTO user_roles (user_id, role)
VALUES ('user-uuid-here', 'admin');`}</pre>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Portfolio Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="card-elevated p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Info className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2">
              About This Portfolio
            </h2>
            <ul className="space-y-2 text-foreground-secondary">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Built with React, TypeScript, and Tailwind CSS
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Backend powered by Lovable Cloud (Supabase)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Animations with Framer Motion
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Full CRUD for projects, tech stack, and timeline
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Contact form with message management
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Basic visitor analytics
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
