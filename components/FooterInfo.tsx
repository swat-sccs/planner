"use client";

import InfoIcon from "@mui/icons-material/Info";
import {
  Button,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import packageInfo from "../package.json";

export default function FooterInfo() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleOpen = () => {
    onOpen();
  };
  return (
    <>
      <div
        role="presentation"
        className="flex flex-wrap gap-3 fixed bottom-10 left-10 opacity-50 hover:opacity-80 invisible sm:visible"
        onClick={() => handleOpen()}
      >
        <InfoIcon />
      </div>
      <Modal backdrop={"blur"} isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Usage & Data Policy
              </ModalHeader>
              <ModalBody>
                <div className="columns-1 container max-w-4xl text-center">
                  <span className="">
                    The Course Planner is a student-run service, and displays
                    classes from the Tri-College course database. We recommend
                    confirming your schedule with the official course listings
                    just in case. If there are any issues,
                  </span>
                  <span>
                    {" "}
                    <Link
                      isExternal
                      className="text-[#f46523]"
                      href="mailto:staff@sccs.swarthmore.edu"
                      title="SCCS Staff Email"
                    >
                      email us.
                    </Link>
                  </span>
                  <br />
                  <br />

                  <div className="space-x-5">
                    <Link
                      isExternal
                      href="https://www.sccs.swarthmore.edu/docs/policy"
                      title="SCCS Usage & Data Policy"
                    >
                      <span className=" underline  ">Usage & Data Policy</span>
                    </Link>
                  </div>
                  <br />
                  <span className="text-sm mt-3 ">
                    © 2024 Swarthmore College Computer Society | v
                    {packageInfo.version}
                  </span>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
