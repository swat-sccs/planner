"use client";
import {
  Card,
  CardBody,
  CardHeader,
  Textarea,
  Autocomplete,
  AutocompleteItem,
  Checkbox,
  Select,
  SelectItem,
  Divider,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Skeleton,
  Link,
} from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";
import React from "react";
import ProfCard from "../../components/profs/ProfCard";
import {
  getProfs,
  getUniqueProfsWithRatings,
} from "../../app/actions/getProfs";
import { Faculty } from "@prisma/client";
import { useRouter } from "next/navigation";

export default function ProfPage() {
  const router = useRouter();
  const [profs, setProfs] = useState<Faculty[]>();

  const loadProfs = useCallback(async () => {
    const apiProfs = await getUniqueProfsWithRatings();

    setProfs(apiProfs);

    // Prevent an infinite loop. TODO: better solution.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadProfs();
  }, [loadProfs]);

  return (
    <>
      <div className="gap-3  flex-col grid grid-cols-3">
        {profs?.map((prof: any) => <ProfCard key={prof.id} prof={prof} />)}
      </div>
    </>
  );
}
