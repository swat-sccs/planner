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
  searchProfs,
} from "../../app/actions/getProfs";
import { Faculty } from "@prisma/client";
import { useRouter } from "next/navigation";

export default function ProfPage(props: any) {
  const router = useRouter();
  const [profs, setProfs] = useState<Faculty[]>();
  const [profQuery, setProfQuery] = useState("");

  async function loadProfs() {
    const searchParams = await props.searchParams;

    //const apiProfs = await getUniqueProfsWithRatings();

    const apiProfs = await searchProfs(searchParams?.prof);

    setProfs(apiProfs);

    // Prevent an infinite loop. TODO: better solution.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }

  useEffect(() => {
    loadProfs();
  }, [props.searchParams]);

  return (
    <>
      <div className="gap-3 flex-col grid lg:grid-cols-3 lg:grid-cols1 mt-5 px-3 overflow-scroll h-[85vh]">
        {profs?.map((prof: any) => <ProfCard key={prof.id} prof={prof} />)}
      </div>
    </>
  );
}
