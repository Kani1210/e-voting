"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";

export default function UserView({
  open,
  onClose,
  user,
  loading,
}) {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-6 max-w-3xl rounded-2xl">

        {/* LOADING */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <Spinner />
          </div>
        )}

        <DialogHeader>
          <DialogTitle>Full User Database Record</DialogTitle>
        </DialogHeader>

        <Separator className="my-4" />

        {/* FULL DATABASE VIEW */}
        <div className="grid grid-cols-2 gap-4 text-sm">

          <Field label="ID" value={user?.id} />
          <Field label="User ID" value={user?.user_id} />
          <Field label="Voter ID" value={user?.voter_id} />

          <Field label="Name" value={user?.name} />
          <Field label="Email" value={user?.email} />

          {/* MASK PASSWORD (IMPORTANT) */}
          <Field
            label="Password"
            value={user?.password ? "******** (hidden)" : "-"}
          />

          <Field label="Gender" value={user?.gender} />
          <Field label="Status" value={user?.status} />
          <Field label="Role" value={user?.role} />

          <Field label="Created At" value={user?.created_at} />
          <Field label="Updated At" value={user?.updated_at} />

          <Field label="Extra 1" value={user?.col11 || "-"} />
          <Field label="Extra 2" value={user?.col12 || "-"} />
          <Field label="Extra 3" value={user?.col13 || "-"} />
          <Field label="Extra 4" value={user?.col14 || "-"} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* FIELD UI */
function Field({ label, value }) {
  return (
    <div className="border rounded-lg p-3 bg-gray-50">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold break-all">
        {value || "-"}
      </p>
    </div>
  );
}