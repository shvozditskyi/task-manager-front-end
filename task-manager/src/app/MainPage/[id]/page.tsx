"use client";
import { useEffect, useState } from "react";
import Column from "@/components/BoardComponent/Column/column";

interface Status {
  id: number;
  name: string;
  orderNumber: number;
}

export default function Board({ params }: { params: any }) {
  const [columns, setColumns] = useState<Status[]>([]);
  const [newColumnName, setNewColumnName] = useState('');
  const [boardName, setBoardName] = useState('');
  const [itemMoved, setItemMoved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("")

  const handleItemMoved = (columnTargetID: number) => {
    console.log("Column to re-render: ", columnTargetID);
    setItemMoved(true);
  };

  const fetchBoardDetails = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/boards/${params.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`
        },
      });
      if (response.ok) {
        const data = await response.json();
        setColumns(data.statuses); // Set columns with fetched statuses
        setBoardName(data.name);
      } else {
        console.error('Failed to fetch board details:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching board details:', error);
    }
  };

  useEffect(() => {
    fetchBoardDetails();
  }, [params.id]); // Dependency array with params.id to refetch if id changes

  const handleAddColumn = async () => {
    try {
      if (newColumnName.trim() !== '') {
        const token = sessionStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:8080/api/boards/newStatus?boardId=${params.id}&name=${newColumnName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`
          },
          body: JSON.stringify({ name: newColumnName, orderNumber: columns.length }),
        });
        if (response.ok) {
          fetchBoardDetails(); // Refresh columns after adding a new one
          setNewColumnName('');
        } else {
          console.error('Failed to create column:', response.statusText);
        }
      } else {
        setErrorMessage("Column name needs at least 1 character")
      }
      } catch (error) {
        console.error('Error adding column:', error);
      }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestType, setRequestType] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [boardId, setBoardId] = useState('');

  const handleInviteUser = async () => {
    try {
        if (receiverEmail.trim() !== '' && requestMessage.trim() !== '') {
            // POST request to invite user
            const token = sessionStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:8080/api/boards/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${token}`
                },
                body: JSON.stringify({ 
                    email: receiverEmail,
                    message: requestMessage,
                    type: requestType,
                    boardId: params.id
                }),
            });
            if (response.ok) {
                alert('Invitation sent!');
                setReceiverEmail('');
                setRequestMessage('');
                setRequestType('BOARD');
                setIsModalOpen(false);
            } else {
                console.error('Failed to send invitation:', response.statusText);
            }
        } else {
          
        }
    } catch (error) {
        console.error('Error sending invitation:', error);
    }
};

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="column h-dvh mt-2 w-1/12 p-4 min-w-32">
      <h2 className="w-full text-center text-lg break-words font-medium ">{boardName}</h2>
        {/* Invite User Button */}
        <div className="flex justify-center">
        <button onClick={() => setIsModalOpen(true)}
          className="invite-window-button m-2 p-1 text-white rounded w-full"
          >Invite User
        </button>
        </div>
          {/* Modal */}
          {isModalOpen && (
                <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
                    <div className="modal-content bg-white p-5 rounded">
                        <h2 className="text-xl text-center mb-4">Invite User</h2>
                        <input
                            type="email"
                            value={receiverEmail}
                            onChange={(e) => setReceiverEmail(e.target.value)}
                            placeholder="Enter user's email..."
                            className="invite-input w-full px-2 py-1 mb-8"
                        />
                        <input
                            type="text"
                            value={requestMessage}
                            onChange={(e) => setRequestMessage(e.target.value)}
                            placeholder="Enter your message..."
                            className="invite-input w-full px-2 py-1 mb-4 h-40"
                        />
                        <div className="invite-buttons">
                        <button
                            onClick={handleInviteUser}
                            className="invite-button px-4 py-2 text-white mr-2"
                        >Send Invite
                        </button>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="invite-button cancel px-4 py-2 text-white"
                        >Cancel
                        </button>
                        </div>
                    </div>
              </div>
          )}
        <h2 className="sidebar-title">Other Boards</h2>
      </div>
      {/* Main Columns */}
      <div className="flex justify-center mt-2 mx-2">
        {columns.map((column) => (
          <Column 
            key={column.id} 
            boardId={params.id} 
            columnId={column.id} 
            title={column.name} 
            columns={columns} 
            onItemMoved={handleItemMoved}
            itemMoved={itemMoved}
            setItemMoved={setItemMoved}
          />
        ))}
        <div className="flex-row justify-center items-center w-80 p-4 mr-4">
          <input
            type="text"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                handleAddColumn();
              }
              if (e.key === "Escape") {
                setNewColumnName("")
              }
            }}
            placeholder="Enter column name..."
            
            className="item-input w-full px-2 py-1"
          />
          <button onClick={handleAddColumn} className="column-button mt-2 px-4 py-1 text-white">
            Add Column
          </button>
        <p className="error text-center">{errorMessage}</p>
        </div>
      </div>
    </div>
  );
}