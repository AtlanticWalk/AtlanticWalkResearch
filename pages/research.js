import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ResearchRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/research-packs'); }, [router]);
  return null;
}
