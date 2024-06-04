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
  
  const mainPage: React.FC = () => {
    const [boards, setBoards] = useState<Board[]>([]);
    const [newBoardName, setNewBoardName] = useState('');
    const [renameBoardName, setRenameBoardName] = useState('');
    const [renamingBoardId, setRenamingBoardId] = useState<number | null>(null);
    const [dropdownVisible, setDropdownVisible] = useState<{ [key: number]: boolean }>({});
    const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

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
        console.log("boards data: ",boardsData);
        
        setBoards(boardsData);
        
        }
      } catch (error) {
        console.error('Error fetching boards:', error);
      }
    };

    useEffect(() => {
      fetchBoards();
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
        const response = await fetch(`http://localhost:8080/api/boards/${boardId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
          body: JSON.stringify({ name: renameBoardName }),
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

  const firstBoard = boards.length > 0 ? boards[0] : null; //Will change later (default board)

  return (
    <div>
      <h1 className="main-title font-bold mt-20 flex justify-center text-center">Choose a board</h1>
      <p className="error text-center"></p>

      <div className="flex flex-row justify-center items-center">
        {firstBoard ? (
          <Link href={`/MainPage/${firstBoard.id}`} className='d-border'>Go to Default Board Page</Link>
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
          placeholder="Enter board name..."
          className="input px-2 py-1 ml-4"
        />
        <button onClick={handleCreateBoard} className="button ml-2">Create Board</button>
      </div>
      <div className='board-items'>
      <ul className='grid grid-cols-4 justify-items-center m-2'>
      {boards.length > 0 ? (
        boards.map((board, index) => (
          <li key={index} className="item-border mb-2 hover:bg-green-300 m-2">
            <div className='grid grid-cols-4'>
              <Link href={`/MainPage/${board.id}`} className='col-span-3'>
                {renamingBoardId === board.id ? (
                  <input
                    type="text"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    onBlur={() => handleRenameBoard(board.id)}
                    className="text-pretty break-words"
                  />
                ) : (
                  <p className='text-pretty break-words'>{board.name}</p>
                )}
              </Link>
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
                  <div ref={el => (dropdownRefs.current[board.id] = el)} className='dropdown-menu absolute right-0 top-2 bg-white border border-gray-300 rounded shadow-lg z-50'>
                    <button
                      className='block px-4 py-2 text-left text-md w-full hover:bg-gray-200'
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBoard(board.id);
                        hideDropdowns();
                      }}
                    >
                      Delete Board
                    </button>
                    <button
                      className='block px-4 py-2 text-left text-md w-full hover:bg-gray-200'
                      onClick={(e) => {
                        e.stopPropagation();
                        // setRenamingBoardId(board.id);
                        // setNewBoardName(board.name);
                        hideDropdowns();
                      }}
                    >
                      Rename Board
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