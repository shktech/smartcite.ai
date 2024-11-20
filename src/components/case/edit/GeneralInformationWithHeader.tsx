import { IconArrowLeft, IconChevronDown } from "@tabler/icons-react";
import { useNavigation, useParsed, useUpdate } from "@refinedev/core";
import { ICase } from "@/types/types";
import { FormEvent, useEffect, useState } from "react";
import {
  CaseStates,
  CaseStateTextColor,
  ClientRoles,
} from "@/utils/util.constants";
import { useForm } from "@mantine/form";
import Link from "next/link";
import { Select } from "antd";
import {
  Button,
  TextInput,
  Select as MantineSelect,
  MultiSelect,
  LoadingOverlay,
  Collapse,
} from "@mantine/core";
import { getAllUsers } from "@/services/keycloak/user.service";
import pRetry from "p-retry";
import { useDisclosure } from "@mantine/hooks";

interface GeneralInformationWithHeaderProps {
  caseData?: ICase;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

const GeneralInformationWithHeader = ({
  caseData,
}: GeneralInformationWithHeaderProps) => {
  const { params } = useParsed();
  const { push } = useNavigation();
  const { mutate: updateMutate } = useUpdate();
  const [opened, { toggle }] = useDisclosure(false);

  const [matterState, setMatterState] = useState(CaseStates[0]);
  const [assignedLawyers, setAssignedLawyers] = useState<string[]>([]);
  const [clientRole, setClientRole] = useState(ClientRoles[0]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);

  const form = useForm({
    initialValues: {
      title: "",
      client: "",
    },
  });

  const fetchUsers = async () => {
    setUserLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await pRetry(() => getAllUsers(token as string));
      setUsers(response);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setUserLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.validate().hasErrors) return;

    setIsLoading(true);
    const payload = {
      title: form.values.title,
      client: form.values.client,
      clientRole,
      assignedLawyers: assignedLawyers.join(","),
      state: matterState,
    };

    updateMutate(
      {
        resource: "cases",
        id: params?.caseId,
        values: payload,
      },
      {
        onError: (error) => {
          console.error(error);
          setIsLoading(false);
          push("/cases");
        },
        onSuccess: () => {
          setIsLoading(false);
          push("/cases");
        },
      }
    );
  };

  useEffect(() => {
    if (caseData) {
      setMatterState(caseData.state);
      setAssignedLawyers(caseData.assignedLawyers.split(","));
      setClientRole(caseData.clientRole);
      form.setValues({
        title: caseData.title,
        client: caseData.client,
      });
    }
  }, [caseData]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const renderHeader = () => (
    <div className="flex justify-between">
      <div className="flex items-center gap-3">
        <Link
          href="/cases"
          className="border rounded-lg p-1.5 border-[#292929]"
        >
          <IconArrowLeft color="#292929" size={24} />
        </Link>
        <div className="text-xl font-semibold text-[#292929]">{caseData?.title || "N/A"}</div>
      </div>
      <div className="flex gap-2">
        <Select
          onChange={setMatterState}
          style={{ width: "120px", height: "100%" }}
          value={matterState}
        >
          {CaseStates.map((state) => (
            <Select.Option key={state} value={state}>
              <span style={{ color: CaseStateTextColor[state] }}>{state}</span>
            </Select.Option>
          ))}
        </Select>
        <Button
          variant="default"
          color="dark.6"
          style={{ borderColor: "black", backgroundColor: "white" }}
          component={Link}
          href="/cases"
        >
          Cancel
        </Button>
        <Button variant="" color="dark.6" type="submit">
          Save
        </Button>
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="bg-white rounded-lg p-4 mt-6">
      <div
        className="text-xl text-[#292929] cursor-pointer flex items-center gap-2 justify-between"
        onClick={toggle}
      >
        <span>General Information</span>
        <IconChevronDown
          size={20}
          className={`transition-transform duration-300 ${
            opened ? "rotate-180" : ""
          }`}
        />
      </div>
      <Collapse in={opened}>
        <div className="mt-3">
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              required
              label="Title"
              placeholder="Enter title here"
              value={form.values.title}
              onChange={(event) =>
                form.setFieldValue("title", event.currentTarget.value)
              }
              error={form.errors.title}
              radius="sm"
              labelProps={{
                style: { color: "black", marginBottom: "6px" },
              }}
            />
            <TextInput
              required
              label="Client"
              placeholder="Enter client here"
              value={form.values.client}
              onChange={(event) =>
                form.setFieldValue("client", event.currentTarget.value)
              }
              error={form.errors.client}
              radius="sm"
              labelProps={{
                style: { color: "black", marginBottom: "6px" },
              }}
            />
            <MantineSelect
              label="Client Role"
              placeholder="Client Role"
              value={clientRole}
              onChange={(value) => setClientRole(value as string)}
              required
              data={["Petitioner", "Respondent"]}
              styles={{
                input: { backgroundColor: "white" },
                label: { color: "black", marginBottom: "6px" },
              }}
            />
            <MultiSelect
              label="Assigned Lawyer"
              required
              placeholder="Assigned Lawyer"
              data={users.map((user) => ({
                value: user.id,
                label: `${user.firstName} ${user.lastName}`,
              }))}
              value={assignedLawyers}
              onChange={setAssignedLawyers}
              styles={{
                input: { backgroundColor: "white" },
                label: { color: "black", marginBottom: "6px" },
              }}
            />
          </div>
        </div>
      </Collapse>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="relative">
      <LoadingOverlay
        visible={isLoading || userLoading}
        zIndex={1000}
        loaderProps={{ color: "black", type: "bars" }}
      />
      {renderHeader()}
      {renderForm()}
    </form>
  );
};

export default GeneralInformationWithHeader;
