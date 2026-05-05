"""
Pre-deployment health check for CareerOS backend.

Verifies that all required environment variables are set and that the
database is reachable and seeded before the app goes live.

Usage:
    python utils/health_check.py
"""

import os
import sys

# Load .env so local checks work too.
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


def check(label: str, passed: bool, detail: str = '') -> bool:
    """Print a single check result and return its pass/fail status."""
    icon = '✅' if passed else '❌'
    suffix = f' — {detail}' if detail else ''
    print(f'  {icon} {label}{suffix}')
    return passed


def main() -> None:
    print('\n🔍 CareerOS Pre-Deployment Health Check\n')
    all_passed = True

    # 1. DATABASE_URL
    db_url = os.getenv('DATABASE_URL', '')
    ok = bool(db_url) and db_url != 'postgresql://postgres.[ref]:[password]@[host]:5432/postgres'
    if not check('DATABASE_URL is set and not placeholder', ok):
        all_passed = False

    # 2. SECRET_KEY
    secret = os.getenv('SECRET_KEY', '')
    ok = len(secret) >= 32
    if not check('SECRET_KEY is set and ≥ 32 characters', ok, f'{len(secret)} chars'):
        all_passed = False

    # 3. FRONTEND_ORIGIN
    origin = os.getenv('FRONTEND_ORIGIN', '')
    ok = origin.startswith('https://')
    if not check('FRONTEND_ORIGIN starts with https://', ok, origin or '(empty)'):
        all_passed = False

    # 4. Database connectivity
    try:
        from database import engine
        with engine.connect() as conn:
            conn.execute(engine.dialect.statement_compiler(engine.dialect, None).process(
                __import__('sqlalchemy').text('SELECT 1')
            ))
        # Simpler approach: just try a raw connection
    except Exception:
        pass

    # Re-attempt with simpler logic
    db_reachable = False
    try:
        from sqlalchemy import create_engine, text
        if db_url and db_url != 'postgresql://postgres.[ref]:[password]@[host]:5432/postgres':
            test_engine = create_engine(db_url)
            with test_engine.connect() as conn:
                conn.execute(text('SELECT 1'))
            db_reachable = True
            test_engine.dispose()
    except Exception as exc:
        db_reachable = False
        if not check('Database is reachable', False, str(exc)[:80]):
            all_passed = False

    if db_reachable:
        check('Database is reachable', True)

        # 5. Opportunities table has data (seed check)
        try:
            from sqlalchemy import create_engine, text as sa_text
            test_engine = create_engine(db_url)
            with test_engine.connect() as conn:
                result = conn.execute(sa_text('SELECT COUNT(*) FROM opportunities'))
                count = result.scalar()
            test_engine.dispose()
            ok = count is not None and count >= 1
            if not check('Opportunities table has seed data', ok, f'{count} rows'):
                all_passed = False
        except Exception as exc:
            if not check('Opportunities table has seed data', False, str(exc)[:80]):
                all_passed = False
    else:
        if db_url and db_url != 'postgresql://postgres.[ref]:[password]@[host]:5432/postgres':
            if not check('Database is reachable', False):
                all_passed = False
        check('Opportunities table has seed data', False, 'skipped (no DB connection)')
        all_passed = False

    # Summary
    print()
    if all_passed:
        print('🎉 All checks passed — ready to deploy!\n')
        sys.exit(0)
    else:
        print('⚠️  Some checks failed — fix the issues above before deploying.\n')
        sys.exit(1)


if __name__ == '__main__':
    main()
