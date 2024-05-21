"use client"
import { useState } from "react";
import Column from "../Column/column"

// Default board only, gonna delete later !!
const Board = () => {
    const [columns, setColumns] = useState<string[]>(['Todo', 'In Progress', 'Done']);
    const [newColumnName, setNewColumnName] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requestMessage, setRequestMessage] = useState('');
    const [requestType, setRequestType] = useState('');
    const [receiverEmail, setReceiverEmail] = useState('');
    const [boardId, setBoardId] = useState('');

    const handleAddColumn = async () => {
        try {
            if (newColumnName.trim() !== '') {
                // Updating the column locally
                setColumns([...columns, newColumnName]);
                setNewColumnName('');

                // POST request to add column
                const token = sessionStorage.getItem('accessToken');
                const response = await fetch(`http://localhost:8080/api/tasks`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${token}`
                    },
                    body: JSON.stringify({ name: newColumnName }),
                });
                if (response.ok) {
                    setColumns([...columns, newColumnName]);
                    setNewColumnName('');
                } else {
                    console.error('Failed to create column:', response.statusText);
                }

                if (!response.ok) {
                    console.log(response)
                    console.error('Failed to add column');
                }
            }
        } catch (error) {
            console.error('Error adding column:', error);
        }
    };

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
                      boardId: boardId
                  }),
              });
              if (response.ok) {
                  alert('Invitation sent!');
                  setReceiverEmail('');
                  setRequestMessage('');
                  setRequestType('BOARD');
                  setBoardId(''); // get boardId
                  setIsModalOpen(false);
              } else {
                  console.error('Failed to send invitation:', response.statusText);
              }
          } else {
              alert('Please fill in all fields.');
          }
      } catch (error) {
          console.error('Error sending invitation:', error);
      }
  };

    return (
        <div className="flex flex-col">
            {/* Invite User Button */}
            <div className="flex justify-center items-center p-4 bg-gray-200">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="invite-window-button px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Invite User
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
                    <div className="modal-content bg-white p-5 rounded">
                        <h2 className="text-xl mb-4">Invite User</h2>
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
                            style={{ textAlign: "left", verticalAlign: "top" }}
                        />
                        <div className="invite-buttons">
                        <button
                            onClick={handleInviteUser}
                            className="invite-button px-4 py-2 text-white mr-2"
                        >
                            Send Invite
                        </button>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="invite-button cancel px-4 py-2 text-white"
                        >
                            Cancel
                        </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex">
                {/* Sidebar */}
                <div className="column h-dvh mt-2 w-1/12 p-4">
                    <h2 className="sidebar-title ">Other Boards</h2>
                    <button className="placeholder-button text-sm mt-2">Placeholder button</button>
                    <button className="placeholder-button text-sm mt-2">Placeholder button</button>
                    <button className="placeholder-button text-sm mt-2">Placeholder button</button>
                </div>
                <div className="flex justify-center mt-2 mx-2">
                    {columns.map((columnName, index) => (
                        <Column key={index} title={columnName} />
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
                        <button onClick={handleAddColumn} className="column-button mt-2 px-4 py-1 text-white ">
                            Add Column
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Board;
