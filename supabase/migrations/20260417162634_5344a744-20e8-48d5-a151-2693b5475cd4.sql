DO $$
DECLARE
  target_emails text[] := ARRAY['nathan@hasht.ag','nathan@nathanfrey.com','frey.nathan@gmail.com'];
  auth_ids uuid[];
  public_ids uuid[];
BEGIN
  SELECT array_agg(id) INTO auth_ids FROM auth.users WHERE email = ANY(target_emails);

  IF auth_ids IS NULL THEN
    RAISE NOTICE 'No matching auth users found';
    RETURN;
  END IF;

  SELECT array_agg(id) INTO public_ids FROM public.users WHERE auth_id = ANY(auth_ids) OR email = ANY(target_emails);

  IF public_ids IS NOT NULL THEN
    DELETE FROM public.relationships WHERE from_user_id = ANY(public_ids) OR to_user_id = ANY(public_ids);
    DELETE FROM public.passion_points WHERE user_id = ANY(public_ids);
    DELETE FROM public.brand_collabs WHERE user_id = ANY(public_ids);
    DELETE FROM public.fan_clubs WHERE owner_id = ANY(public_ids);
    DELETE FROM public.social_links WHERE user_id = ANY(public_ids);
    DELETE FROM public.profiles WHERE user_id = ANY(public_ids);
    DELETE FROM public.users WHERE id = ANY(public_ids);
  END IF;

  DELETE FROM auth.identities WHERE user_id = ANY(auth_ids);
  DELETE FROM auth.users WHERE id = ANY(auth_ids);
END $$;