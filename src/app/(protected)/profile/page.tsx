'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  FileText,
  Github,
  Edit2,
  Download,
  QrCode,
  Loader2,
  Star,
  ShieldCheck,
  Trophy,
  Code2,
  Share2,
  Clock,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function StudentProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [githubStats, setGithubStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const userId = id || user?.uid;

  useEffect(() => {
    if (!userId) return;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Enriched Data based on previous request but with consistent layout
        const data = {
          fullName: user?.name || "Arjun Patel",
          role: "B.Tech Computer Science",
          semester: "7th Semester",
          bio: "Passionate full-stack developer specializing in React and Node.js. Love building tools that make life easier.",
          stats: {
            cgpa: 8.92,
            performance: 92,
            attendance: 95,
            rank: 12
          },
          skills: [
            { name: "React", level: 90, icon: <Code2 className="w-4 h-4" /> },
            { name: "TypeScript", level: 85, icon: <Star className="w-4 h-4" /> },
            { name: "Node.js", level: 80, icon: <Zap className="w-4 h-4" /> },
            { name: "PostgreSQL", level: 75, icon: <FileText className="w-4 h-4" /> }
          ],
          projects: [
            { title: "Campus ERP", desc: "A full-scale college management solution.", tags: ["Next.js", "Prisma"] },
            { title: "AI Resumes", desc: "Automated resume builder for students.", tags: ["React", "AI"] }
          ],
          socials: {
            github: "arjunpatel",
            linkedin: "arjun-pec"
          }
        };
        setProfileData(data);
        setGithubStats({
          stars: 124,
          repos: 45,
          followers: 890,
          contributions: 1402
        });
      } catch (err) {
        toast.error("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [userId, user]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile link copied!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl p-6 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Info (Sync with Older UI Pattern) */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="overflow-hidden border-2 border-primary/10 shadow-xl bg-card">
             <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20" />
             <div className="px-6 pb-6 -mt-16 text-center">
               <Avatar className="w-32 h-32 mx-auto border-4 border-background shadow-2xl ring-2 ring-primary/20">
                 <AvatarImage src={user?.avatar} />
                 <AvatarFallback className="text-3xl bg-primary/10 text-primary font-black">
                    {profileData?.fullName?.[0]}
                 </AvatarFallback>
               </Avatar>
               
               <div className="mt-6 space-y-2">
                 <h2 className="text-4xl font-[1000] tracking-tighter leading-none">{profileData?.fullName}</h2>
                 <p className="text-primary font-black uppercase text-sm tracking-widest">{profileData?.role}</p>
                 <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-black uppercase tracking-wider">
                   <MapPin className="w-4 h-4 text-accent" />
                   <span>PEC, Chandigarh</span>
                 </div>
               </div>

               <div className="flex gap-2 mt-6">
                 <Button onClick={handleShare} variant="outline" size="sm" className="flex-1 gap-2 border-primary/20 font-bold uppercase text-[10px] tracking-widest">
                   <Share2 className="w-3.5 h-3.5" /> Share
                 </Button>
                 <Button size="sm" className="flex-1 gap-2 bg-primary text-primary-foreground font-bold uppercase text-[10px] tracking-widest">
                   <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                 </Button>
               </div>
             </div>
          </Card>

          <Card className="border-primary/10 shadow-lg bg-card translate-y-0 hover:-translate-y-1 transition-transform">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                <ShieldCheck className="w-4 h-4" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 group overflow-hidden relative">
                <div className="absolute inset-y-0 left-0 w-1 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform" />
                <Mail className="w-5 h-5 text-primary" />
                <div className="overflow-hidden">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Email ADDRESS</p>
                  <p className="text-sm font-bold truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 group overflow-hidden relative">
                <div className="absolute inset-y-0 left-0 w-1 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform" />
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Phone Number</p>
                  <p className="text-sm font-bold">+91 98765-43210</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Detailed Info (Sync with Older UI Pattern) */}
        <div className="lg:col-span-2 space-y-8">
           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
             <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-8">
               {['overview', 'academic', 'projects', 'achievements'].map((tab) => (
                 <TabsTrigger 
                   key={tab} 
                   value={tab}
                   className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 py-3 text-xs font-black uppercase tracking-widest transition-all"
                 >
                   {tab}
                 </TabsTrigger>
               ))}
             </TabsList>

             <TabsContent value="overview" className="mt-8 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {[
                     { label: "CGPA", value: profileData.stats.cgpa, icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
                     { label: "Attend.", value: profileData.stats.attendance + "%", icon: Clock, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                     { label: "Perf.", value: profileData.stats.performance + "%", icon: Zap, color: "text-sapphire-500", bg: "bg-sapphire-500/10" },
                     { label: "Rank", value: "#" + profileData.stats.rank, icon: Trophy, color: "text-purple-500", bg: "bg-purple-500/10" }
                   ].map((stat, i) => (
                     <Card key={i} className="border-primary/5 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                        <CardContent className="p-4 flex flex-col items-center text-center relative">
                           <div className={`p-2 rounded-xl ${stat.bg} mb-2 group-hover:scale-110 transition-transform`}>
                              <stat.icon className={`w-5 h-5 ${stat.color}`} />
                           </div>
                           <p className="text-xl font-black">{stat.value}</p>
                           <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">{stat.label}</p>
                        </CardContent>
                     </Card>
                   ))}
                </div>

                <Card className="border-primary/10 shadow-lg bg-card">
                   <CardHeader>
                     <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-primary" />
                        Technical Expertise
                     </CardTitle>
                     <CardDescription className="text-xs font-medium">Self-assessment based on active deployments</CardDescription>
                   </CardHeader>
                   <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {profileData.skills.map((skill: any, i: number) => (
                        <div key={i} className="space-y-3">
                           <div className="flex justify-between items-end">
                             <div className="flex items-center gap-2">
                               <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                 {skill.icon}
                               </div>
                               <span className="font-black text-sm uppercase tracking-tight">{skill.name}</span>
                             </div>
                             <span className="text-xs font-black text-primary">{skill.level}%</span>
                           </div>
                           <Progress value={skill.level} className="h-1.5 rounded-full overflow-hidden bg-primary/5 [&>div]:bg-primary" />
                        </div>
                      ))}
                   </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <Card className="border-primary/10 shadow-lg bg-card overflow-hidden">
                      <div className="p-1 bg-gradient-to-r from-primary to-accent" />
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <div className="space-y-1">
                           <CardTitle className="text-sm font-black uppercase tracking-widest">GitHub Activity</CardTitle>
                           <CardDescription className="text-[10px] font-bold">Live telemetry from @{profileData.socials.github}</CardDescription>
                         </div>
                         <Github className="w-6 h-6 text-primary/40" />
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-4 pb-6 mt-4">
                         <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10 text-center group hover:bg-primary/10 transition-colors">
                            <p className="text-xl font-black">{githubStats?.contributions}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Commits</p>
                         </div>
                         <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10 text-center group hover:bg-primary/10 transition-colors">
                            <p className="text-xl font-black">{githubStats?.stars}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Stars</p>
                         </div>
                      </CardContent>
                   </Card>

                   <Card className="border-primary/10 shadow-lg bg-card overflow-hidden">
                      <div className="p-1 bg-gradient-to-r from-accent to-primary" />
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <div className="space-y-1">
                            <CardTitle className="text-sm font-black uppercase tracking-widest">Digital CV</CardTitle>
                            <CardDescription className="text-[10px] font-bold">Generate institutional dossier</CardDescription>
                         </div>
                         <FileText className="w-6 h-6 text-primary/40" />
                      </CardHeader>
                      <CardContent className="flex items-center gap-4 pb-6 mt-4">
                         <Button className="flex-1 gap-2 bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest h-11 rounded-xl">
                           <Download className="w-3.5 h-3.5" /> Download Dossier
                         </Button>
                         <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-primary/10">
                            <QrCode className="w-4 h-4 text-primary" />
                         </Button>
                      </CardContent>
                   </Card>
                </div>
             </TabsContent>

             <TabsContent value="academic">
                <Card className="border-dashed border-2 py-12 bg-muted/20">
                  <CardContent className="text-center text-muted-foreground">
                    <Clock className="w-8 h-8 animate-pulse mx-auto mb-4 opacity-20" />
                    <p className="font-bold uppercase tracking-widest text-xs">Section being prepared for deployment.</p>
                  </CardContent>
                </Card>
             </TabsContent>
           </Tabs>
        </div>
      </div>
    </div>
  );
}
