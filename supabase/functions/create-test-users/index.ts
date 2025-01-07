import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Delete existing test users if they exist
    const { data: existingUsers } = await supabaseClient
      .from('profiles')
      .select('id')
      .in('email', ['admin@company.com', 'manager@company.com', 'employee@company.com']);

    if (existingUsers && existingUsers.length > 0) {
      for (const user of existingUsers) {
        await supabaseClient.auth.admin.deleteUser(user.id);
      }
    }

    // Create HR Admin
    const { data: adminData, error: adminError } = await supabaseClient.auth.admin.createUser({
      email: 'admin@company.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        name: 'Admin User',
        email: 'admin@company.com',
        employeeId: 'HR001',
        role: 'HR'
      }
    })

    if (adminError) throw adminError;

    // Create Manager
    const { data: managerData, error: managerError } = await supabaseClient.auth.admin.createUser({
      email: 'manager@company.com',
      password: 'manager123',
      email_confirm: true,
      user_metadata: {
        name: 'Manager User',
        email: 'manager@company.com',
        employeeId: 'MGR001',
        role: 'MANAGER'
      }
    })

    if (managerError) throw managerError;

    // Create Employee
    const { data: employeeData, error: employeeError } = await supabaseClient.auth.admin.createUser({
      email: 'employee@company.com',
      password: 'employee123',
      email_confirm: true,
      user_metadata: {
        name: 'Employee User',
        email: 'employee@company.com',
        employeeId: 'EMP001',
        role: 'EMPLOYEE'
      }
    })

    if (employeeError) throw employeeError;

    return new Response(
      JSON.stringify({ 
        message: 'Test users created successfully',
        admin: adminData,
        manager: managerData,
        employee: employeeData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating test users:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})