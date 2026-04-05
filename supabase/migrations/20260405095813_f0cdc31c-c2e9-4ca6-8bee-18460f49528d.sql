
-- Drop the overly permissive policies
DROP POLICY "Public can submit buy requests" ON public.buy_requests;
DROP POLICY "Public can submit deploy requests" ON public.deploy_requests;
DROP POLICY "Public can submit build requests" ON public.build_requests;

-- Recreate with field validation
CREATE POLICY "Public can submit buy requests" ON public.buy_requests
  FOR INSERT WITH CHECK (
    buyer_name IS NOT NULL AND buyer_name <> '' AND
    buyer_email IS NOT NULL AND buyer_email <> '' AND
    status = 'new'
  );

CREATE POLICY "Public can submit deploy requests" ON public.deploy_requests
  FOR INSERT WITH CHECK (
    full_name IS NOT NULL AND full_name <> '' AND
    email IS NOT NULL AND email <> '' AND
    project_name IS NOT NULL AND project_name <> '' AND
    status = 'new'
  );

CREATE POLICY "Public can submit build requests" ON public.build_requests
  FOR INSERT WITH CHECK (
    full_name IS NOT NULL AND full_name <> '' AND
    email IS NOT NULL AND email <> '' AND
    status = 'new'
  );
