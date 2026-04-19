import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ModelsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/research-packs'); }, [router]);
  return null;
}
