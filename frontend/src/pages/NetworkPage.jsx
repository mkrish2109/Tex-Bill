import { useState, useEffect, useCallback, useRef } from "react";
import AvailableUsersList from "../components/AvailableUsersList";
import { useAvailableWorkers } from "../hooks/useRequests";
import { FaSort } from "react-icons/fa";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { ErrorAlert } from "../components/common/Alert";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { Button } from "flowbite-react";
import { PageMeta } from "../components/common/PageMeta";
import SearchInput from "../components/common/SearchInput";
import { toastInfo } from "../utils/toastHelpers";

const NetworkPage = () => {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const { socket, isConnected, isInitializing } = useSocket();
  const listenersSetRef = useRef(false);
  const [isSocketReady, setIsSocketReady] = useState(false);

  const { availableUsers, loading, error, sendRequest, refetchUsers } =
    useAvailableWorkers();

  const handleWorkerUpdate = useCallback(
    (data) => {
      toastInfo(
        `Worker availability updated: ${data.workerName} is now ${data.status}`
      );
      refetchUsers();
    },
    [refetchUsers]
  );

  const handleNewWorker = useCallback(
    (data) => {
      toast.success(`New worker registered: ${data.workerName}`);
      refetchUsers();
    },
    [refetchUsers]
  );

  useEffect(() => {
    if (isInitializing) {
      return; // Don't do anything while socket is initializing
    }

    // Add a small delay to ensure socket is ready
    const socketReadyTimeout = setTimeout(() => {
      setIsSocketReady(true);
    }, 2000);

    return () => {
      clearTimeout(socketReadyTimeout);
    };
  }, [isInitializing]);

  useEffect(() => {
    if (!isSocketReady || isInitializing) {
      return;
    }

    if (!socket || !isConnected) {
      if (socket && !isConnected) {
        toast.custom(
          <div className="bg-yellow-400 text-black p-3 rounded">
            Connection to real-time updates is not available. Some features may
            be limited.
          </div>
        );
      }
      return;
    }

    if (listenersSetRef.current) {
      return;
    }

    try {
      // Listen for worker availability updates and new registrations
      socket.on("worker_availability_update", handleWorkerUpdate);
      socket.on("new_worker_registered", handleNewWorker);

      // Handle connection events
      socket.on("connect_error", (error) => {
        toast.error("Connection error: " + error.message);
      });

      socket.on("reconnect_attempt", (attemptNumber) => {
        toastInfo(`Attempting to reconnect (${attemptNumber}/5)...`);
      });

      socket.on("reconnect", () => {
        toast.success("Reconnected to real-time updates");
        refetchUsers(); // Refresh data after reconnection
      });

      listenersSetRef.current = true;
    } catch (error) {
      console.error("Error setting up socket listeners:", error);
      toast.error("Failed to setup real-time updates");
    }

    return () => {
      if (socket && listenersSetRef.current) {
        try {
          socket.off("worker_availability_update", handleWorkerUpdate);
          socket.off("new_worker_registered", handleNewWorker);
          socket.off("connect_error");
          socket.off("reconnect_attempt");
          socket.off("reconnect");
          listenersSetRef.current = false;
        } catch (error) {
          console.error("Error cleaning up socket listeners:", error);
        }
      }
    };
  }, [
    socket,
    isConnected,
    isInitializing,
    isSocketReady,
    handleWorkerUpdate,
    handleNewWorker,
    refetchUsers,
  ]);

  // Filter and sort users
  const filteredUsers = (
    availableUsers?.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.experience &&
          user.experience.toLowerCase().includes(searchTerm.toLowerCase()))
    ) || []
  ).sort((a, b) => {
    if (sortBy === "name") {
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === "experience") {
      const expA = a.experience || "";
      const expB = b.experience || "";
      return sortOrder === "asc"
        ? expA.localeCompare(expB)
        : expB.localeCompare(expA);
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers?.length / itemsPerPage);
  const paginatedUsers = filteredUsers?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (type) => {
    if (sortBy === type) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(type);
      setSortOrder("asc");
    }
  };

  const handleSendRequest = async (workerId, message) => {
    try {
      await sendRequest(workerId, message);
    } catch (error) {
      toast.error(error.message || "Failed to send request");
    }
  };

  if (role !== "buyer") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4"
          role="alert"
        >
          <p>
            Only buyers can access this page. Workers can view and respond to
            requests in the Requests page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <>
      <PageMeta
        title="Network | Bill Sync - Connect with Professionals"
        description="Expand your professional network on Bill Sync. Connect with skilled workers and businesses to grow your opportunities."
        keywords="professional network, business connections, worker network, professional networking, business opportunities"
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold mb-6 text-primary-light dark:text-primary-dark">
              Find Workers
            </h1>

            <div className="flex gap-4">
              {/* Search Input */}
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search workers..."
              />

              {/* Sort Buttons */}
              <div className="flex gap-2">
                <Button
                  color="primary"
                  onClick={() => toggleSort("name")}
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <FaSort />
                  <span>Name</span>
                  {sortBy === "name" && (
                    <span className="text-xs">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </Button>
                <Button
                  color="secondary"
                  onClick={() => toggleSort("experience")}
                  className={`flex items-center gap-2 px-4 py-2`}
                >
                  <FaSort />
                  <span>Experience</span>
                  {sortBy === "experience" && (
                    <span className="text-xs">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <AvailableUsersList
            users={paginatedUsers}
            userType={role}
            onSendRequest={handleSendRequest}
            loading={loading}
            error={error}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-primary-light dark:text-primary-dark">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NetworkPage;
