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

    // Create HR Admin
    await supabaseClient.auth.admin.createUser({
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

    // Create Manager
    await supabaseClient.auth.admin.createUser({
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

    // Create Employee
    await supabaseClient.auth.admin.createUser({
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

    return new Response(
      JSON.stringify({ message: 'Test users created successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})