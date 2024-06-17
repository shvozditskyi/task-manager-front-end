"use client"
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

type Board = {
  id: number;
  name: string;
  description: string | null;
  isOwner: boolean;
  isDefault: boolean;
  email: string;
};

interface Invite {
  id: number;
  requestMessage: string;
  requestStatus: string;
  senderEmail: string;
  receiverEmail: string;
  boardId: number;
}

const mainPage: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [newBoardName, setNewBoardName] = useState('');
  const [renameBoardName, setRenameBoardName] = useState('');
  const [renamingBoardId, setRenamingBoardId] = useState<number | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState<{ [key: number]: boolean }>({});
  const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [defaultBoard, setDefaultBoard] = useState<Board | null>(boards.length > 0 ? boards.find(board => board.isDefault) || boards[0] : null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteErrorMessage, setInviteErrorMessage] = useState("")
  const [invites, setInvites] = useState<Invite[]>([]);


  // HTTP GET to fetch the boards
  const fetchBoards = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/boards', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch boards');
      } else {
        const data = await response.json();
        // console.log("Data: ",data);
        const boardsData = data.map((item: any) => ({
          ...item.board,
          email: item.board.participants?.[0].email || "no email"
        }));
        setBoards(boardsData);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
    }
  };

  const fetchDefaultBoard = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/boards/default`, {
        headers: {
          'Authorization': `${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDefaultBoard(data);
      } else {
        console.error('Failed to fetch default board:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching default board:', error);
    }
  };

  useEffect(() => {
    fetchBoards();
    fetchDefaultBoard();
  }, []); // initial render

  // HTTP POST to create a new board
  // https://httpbin.org/post
  // http://localhost:8080/api/boards
  const handleCreateBoard = async () => {
    if (newBoardName.trim() !== '') {
      try {
        // console.log("name test:", newBoardName)
        const token = sessionStorage.getItem('accessToken');
        const response = await fetch('http://localhost:8080/api/boards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
          body: JSON.stringify({
            name: newBoardName
          }), // only name is required
        });
        let errorElement = document.querySelector(".error")!;
        errorElement.innerHTML = ""
        if (!response.ok) {
          throw new Error('Failed to create board');
        } else {
          fetchBoards();
          setNewBoardName('');
        }
      } catch (error) {
        console.error('Error creating board:', error);
      }
    } else { //error message
      let errorElement = document.querySelector(".error")!;
      errorElement.innerHTML = "Board needs to be at least 1 character long"
    }

  };

  const handleRenameBoard = async (boardId: number) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/boards/name?boardId=${boardId}&name=${renameBoardName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        // body: JSON.stringify({ name: renameBoardName }),
      });
      if (response.ok) {
        setBoards(prevBoards =>
          prevBoards.map(board =>
            board.id === boardId ? { ...board, name: renameBoardName } : board
          )
        );
        setRenamingBoardId(null);
        setRenameBoardName('');
      } else {
        console.error('Failed to rename board:', response.statusText);
      }
    } catch (error) {
      console.error('Error renaming board:', error);
    }
  };

  // HTTP DELETE to remove a board
  const handleDeleteBoard = async (id: number) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/boards/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete board');
      }
      setBoards(prevBoards => prevBoards.filter(board => board.id !== id));
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  };

  // Toggle visibility
  const toggleDropdown = (id: number) => {
    setDropdownVisible(prevState => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  // Hide dropdowns
  const hideDropdowns = () => {
    setDropdownVisible({});
  };

  // Handle click outside dropdown and ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (Object.values(dropdownRefs.current).some(ref => ref && ref.contains(target))) {
        return;
      }
      hideDropdowns();
    };

    const handleEscKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hideDropdowns();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKeyPress);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKeyPress);
    };
  }, []);

  const handleSetDefaultBoard = async (board: Board) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/boards/default/${board.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        body: JSON.stringify({ isDefault: true })
      });

      if (response.ok) {
        // Update the boards state to reflect the default board change
        setDefaultBoard(board);
        setBoards((prevBoards) =>
          prevBoards.map((b) =>
            b.id === board.id ? { ...b, isDefault: true } : { ...b, isDefault: false }
          )
        );
      } else {
        console.error('Failed to set default board:', response.statusText);
      }
    } catch (error) {
      console.error('Error setting default board:', error);
    }
  };

  const handleFetchInvites = async () => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/user-request`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      });
      if (response.ok) {
        const data: Invite[] = await response.json();
        setInvites(data);
        console.log(data);

      } else {
        console.error('Failed to fetch invites:', response.statusText);
        setInviteErrorMessage('Failed to fetch invites');
      }
    } catch (error) {
      console.error('Error fetching invites:', error);
      setInviteErrorMessage('Failed to fetch invites');
    }
  };

  const handleAcceptInvite = async (inviteId: number) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/user-request/manage/${inviteId}?accepted=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      });
      if (response.ok) {
        console.log(`Invite ${inviteId} accepted successfully.`);
        fetchBoards();
        handleFetchInvites();
      } else {
        console.error(`Failed to accept invite ${inviteId}:`, response.statusText);
      }
    } catch (error) {
      console.error(`Error accepting invite ${inviteId}:`, error);
    }
  };

  const handleDeleteInvite = async (inviteId: number) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/user-request/manage/${inviteId}?accepted=false`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      });
      if (response.ok) {
        console.log(`Invite ${inviteId} Deleted successfully.`);
        handleFetchInvites();
      } else {
        console.error(`Failed to Delete invite ${inviteId}:`, response.statusText);
      }
    } catch (error) {
      console.error(`Error Deleting invite ${inviteId}:`, error);
    }
  };

  return (
    <div>
      <div className='w-full flex justify-center mt-20'>
        <img src="/TM_logo.png" alt="logo" height={100} width={100} />
      </div>
      <h1 className="main-title font-bold flex justify-center text-center">Choose a board</h1>
      <p className="error text-center"></p>

      <div className="flex flex-row justify-center items-center">
        {defaultBoard ? (
          <Link href={`/MainPage/${defaultBoard.id}`} className='d-border hidden md:flex'>
            Go to Default Board Page
          </Link>
        ) : (
          <p></p>
        )}
        <input
          type="text"
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              handleCreateBoard();
            }
          }}
          placeholder="Enter board name"
          className="input px-2 py-1 ml-4"
        />
        <button onClick={handleCreateBoard} className="button ml-2">Create Board</button>
        <button onClick={() => {
          setIsModalOpen(true);
          handleFetchInvites()
        }} className="button ml-2">Show invites</button>
        {isModalOpen && (
          <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="modal-content bg-white p-5 rounded shadow-lg">
              <h2 className="text-xl text-center mb-4">Invite Requests</h2>
              <p className="error text-center font-bold">{inviteErrorMessage}</p>
              <div className='Invites'>
                {invites.length > 0 ? (
                  <ul>
                    {invites.map((invite, index) => (
                      <li key={index} className="border p-2 mb-2">
                        <p><strong>Request Message:</strong> {invite.requestMessage}</p>
                        <p><strong>Request Status:</strong> {invite.requestStatus}</p>
                        <p><strong>Sender Email:</strong> {invite.senderEmail}</p>
                        <p><strong>Board ID:</strong> {invite.boardId}</p>
                        <div className='buttons flex justify-center gap-8'>
                          <button className='bg-green-500 hover:bg-green-700 transition-all rounded p-1'
                            onClick={() => handleAcceptInvite(invite.id)}>Accept</button>
                          <button className='bg-red-500 hover:bg-red-700 transition-all rounded p-1'
                            onClick={() => handleDeleteInvite(invite.id)}>Deny</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No invites found</p>
                )}
              </div>
              <div className="invite-buttons flex justify-center mt-4">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                  }}
                  className="invite-button cancel px-4 py-2 text-white bg-red-500 rounded hover:bg-red-700"
                >Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className='board-items'>
        <ul className='grid grid-cols-3 md:grid-cols-4 justify-items-center m-2'>
          {boards.length > 0 ? (
            boards.map((board, index) => (
              <li key={index} className="item-border mb-4 hover:bg-green-300 m-2">
                <div className='grid grid-cols-4'>
                  <div className='col-span-3'>
                    {renamingBoardId === board.id ? (
                      <input
                        type="text"
                        value={renameBoardName}
                        onChange={(e) => setRenameBoardName(e.target.value)}
                        onBlur={() => handleRenameBoard(board.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleRenameBoard(board.id);
                          }
                          if (e.key === 'Escape') {
                            setRenamingBoardId(null);
                            setRenameBoardName('');
                          }
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent navigation on input click
                        className="text-pretty break-words"
                        autoFocus
                      />
                    ) : (
                      <Link href={`/MainPage/${board.id}`} passHref>
                        <p className='text-pretty break-words'>{board.name}</p>
                      </Link>
                    )}
                  </div>
                  <div className='col-span-1'>
                    <button
                      className='board-menu cursor-pointer '
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(board.id);
                      }}
                    >
                      <img src={"/more.png"} alt="More Options" className="h-6 w-6 p-1 hover:bg-green-400 rounded" />
                    </button>
                    {dropdownVisible[board.id] && (
                      <div ref={el => (dropdownRefs.current[board.id] = el)} className='dropdown-menu absolute right-0 -top-4 bg-white border border-gray-300 rounded shadow-lg z-50'>
                        <button
                          className='block px-4 py-2 text-left text-md w-full hover:bg-gray-200'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBoard(board.id);
                            hideDropdowns();
                          }}
                        > Delete Board
                        </button>
                        <button
                          className='block px-4 py-2 text-left text-md w-full hover:bg-gray-200'
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenamingBoardId(board.id);
                            setRenameBoardName(board.name);
                            hideDropdowns();
                          }}
                        > Rename Board
                        </button>
                        <button
                          className='block px-4 py-2 text-left text-md w-full hover:bg-gray-200'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefaultBoard(board)
                            hideDropdowns();
                          }}
                        > Set default
                        </button>
                      </div>
                    )}
                    <p id='email' className='py-2 -ml-4 text-xs truncate sm:text-clip'>{board.email}</p>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className='col-span-3'>No boards available</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default mainPage