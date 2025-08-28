import { requireAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function updateProfile(formData: FormData) {
  "use server";
  const name = formData.get("name");
  const email = formData.get("email");
  console.log("Update profile", { name, email });
}

export default async function SettingsPage() {
  const user = await requireAuth();

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <form action={updateProfile} className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={user?.name ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={user?.email ?? ""} />
        </div>
        <Button type="submit">Save</Button>
      </form>
    </div>
  );
}
