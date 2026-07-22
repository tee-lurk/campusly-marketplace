"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  loading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete listing?",
  description = "Are you sure you want to delete this listing? This action cannot be undone.",
  loading = false,
}: DeleteConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
          <AlertTriangle size={24} className="text-red-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold font-heading text-text-primary dark:text-gray-100 mb-1">
            {title}
          </h3>
          <p className="text-sm text-text-muted leading-relaxed">{description}</p>
        </div>
        <div className="flex gap-3 w-full mt-2">
          <Button variant="secondary" fullWidth onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" fullWidth onClick={onConfirm} loading={loading}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
