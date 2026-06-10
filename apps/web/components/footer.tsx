import { APP_CREDIT } from '@novanode/shared';

/** Required branding credit — must appear across the app per PRD. */
export function Footer() {
  return (
    <footer className="border-t py-4 text-center text-sm text-muted-foreground">
      {APP_CREDIT}
    </footer>
  );
}
