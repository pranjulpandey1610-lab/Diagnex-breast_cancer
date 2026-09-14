"""rls_policies

Revision ID: 1cfcc7bf683f
Revises: 3a998b1840c2
Create Date: 2026-09-14 17:14:36.390284

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1cfcc7bf683f'
down_revision: Union[str, Sequence[str], None] = '3a998b1840c2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Enable RLS on all tables
    op.execute("ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE breast_awareness_sessions ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE saved_reports ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE specialists ENABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE research_datasets ENABLE ROW LEVEL SECURITY;")

    # 2. Supabase Auth trigger to auto-create profile
    op.execute("""
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger AS $$
    BEGIN
      INSERT INTO public.profiles (id, email, full_name, is_active)
      VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', true);
      
      -- If the user meta data contains a role, we could map it here, but by default we can assume 'patient'
      -- The role assignment can be handled by app logic or a separate trigger.
      
      RETURN new;
    END;
    $$ language plpgsql security definer;
    """)

    op.execute("""
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    """)

    # 3. Create RLS Policies
    
    # Profiles: Users can view and update their own profile
    op.execute("""
    CREATE POLICY "Users can view own profile" ON profiles
      FOR SELECT USING (auth.uid() = id);
    CREATE POLICY "Users can update own profile" ON profiles
      FOR UPDATE USING (auth.uid() = id);
    """)

    # Patient Profiles: Users can view and update their own patient profile
    op.execute("""
    CREATE POLICY "Users can view own patient profile" ON patient_profiles
      FOR SELECT USING (profile_id = auth.uid());
    CREATE POLICY "Users can insert own patient profile" ON patient_profiles
      FOR INSERT WITH CHECK (profile_id = auth.uid());
    CREATE POLICY "Users can update own patient profile" ON patient_profiles
      FOR UPDATE USING (profile_id = auth.uid());
    """)

    # Breast Awareness Sessions
    op.execute("""
    CREATE POLICY "Users can manage own breast sessions" ON breast_awareness_sessions
      FOR ALL USING (
        patient_id IN (SELECT id FROM patient_profiles WHERE profile_id = auth.uid())
      );
    """)

    # Specialists (Public Read)
    op.execute("""
    CREATE POLICY "Anyone can view specialists" ON specialists
      FOR SELECT USING (true);
    """)
    
    # Example Admin Policy (Assuming we have a function `is_admin()`)
    op.execute("""
    CREATE OR REPLACE FUNCTION public.is_admin()
    RETURNS boolean AS $$
    BEGIN
      -- Simplistic check assuming role mapping exists
      RETURN EXISTS (
        SELECT 1 FROM profile_roles pr
        JOIN roles r ON pr.role_id = r.id
        WHERE pr.profile_id = auth.uid() AND r.name = 'admin'
      );
    END;
    $$ language plpgsql security definer;
    """)

    op.execute("""
    CREATE POLICY "Admins can do anything on profiles" ON profiles
      FOR ALL USING (public.is_admin());
    """)


def downgrade() -> None:
    # Drop policies
    op.execute("DROP POLICY IF EXISTS \"Users can view own profile\" ON profiles;")
    op.execute("DROP POLICY IF EXISTS \"Users can update own profile\" ON profiles;")
    op.execute("DROP POLICY IF EXISTS \"Users can view own patient profile\" ON patient_profiles;")
    op.execute("DROP POLICY IF EXISTS \"Users can insert own patient profile\" ON patient_profiles;")
    op.execute("DROP POLICY IF EXISTS \"Users can update own patient profile\" ON patient_profiles;")
    op.execute("DROP POLICY IF EXISTS \"Users can manage own breast sessions\" ON breast_awareness_sessions;")
    op.execute("DROP POLICY IF EXISTS \"Anyone can view specialists\" ON specialists;")
    op.execute("DROP POLICY IF EXISTS \"Admins can do anything on profiles\" ON profiles;")
    
    # Drop triggers
    op.execute("DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;")
    op.execute("DROP FUNCTION IF EXISTS public.handle_new_user();")
    op.execute("DROP FUNCTION IF EXISTS public.is_admin();")
    
    # Disable RLS
    op.execute("ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE patient_profiles DISABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE breast_awareness_sessions DISABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE uploads DISABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE saved_reports DISABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE specialists DISABLE ROW LEVEL SECURITY;")
    op.execute("ALTER TABLE research_datasets DISABLE ROW LEVEL SECURITY;")
