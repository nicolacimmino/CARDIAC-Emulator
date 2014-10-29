cardiacApp = angular.module('cardiacApp', ['ngSanitize']);
	
cardiacApp.controller('cardiacController', function($scope) 
{						
			
	$scope.rawAssembly = localStorage.getItem("lastSource");
			
	$scope.executeOneStep = function() 
	{		    
		if($scope.registers.halt)
		{			
			return;
		}
					
		$scope.opcode = $scope.memory[$scope.registers.pc].substring(0,1);
		$scope.argument = parseInt($scope.memory[$scope.registers.pc].substring(1,3));			
					
		$scope.registers.pc++;
		
		$scope.lastChangedMemoryLocation=-1;
					
		switch($scope.opcode) 
		{
			case "0": executeInp(); break; 
			case "1": executeCla(); break; 
			case "2": executeAdd(); break; 
			case "3": executeTac(); break; 
			case "4": executeSft(); break; 
			case "5": executeOut(); break;
			case "6": executeSto(); break;
			case "7": executeSub(); break;
			case "8": executeJmp(); break;
			case "9": executeHrs(); break;
		}	

		// Provide a human readable explanation of what the next
		// instruction will do, so users can know what to expect
		// when pressing the button to execute one more step.					
		if($scope.registers.halt)
		{			
			$scope.nextInstructionExplanation = "The processor in halted state. No instructions will be executed.<br><br>Press <kbd>Reset</kbd> to restart.";
		}
		else
		{
			$scope.nextInstructionExplanation = $scope.explain($scope.memory[$scope.registers.pc]);
		}
	};
	
	$scope.assemble = function() 
	{
		$scope.binaryCode=[];
		
		localStorage.setItem("lastSource", $scope.rawAssembly);
					
		var memoryIndex = 0;
		$scope.rawAssembly.split("\n").forEach(function(line) 
		{
			var tokens = line.toLowerCase().split(" ");
			switch(tokens[0]) 
			{
				case "inp": opcode = "0"; break; 
				case "cla": opcode = "1"; break; 
				case "add": opcode = "2"; break; 
				case "tac": opcode = "3"; break; 
				case "sft": opcode = "4"; break; 
				case "out": opcode = "5"; break;
				case "sto": opcode = "6"; break;
				case "sub": opcode = "7"; break;
				case "jmp": opcode = "8"; break;
				case "hrs": opcode = "9"; break;
			}		
			
			argument=(tokens[1]!="")?tokens[1]:"00";
			if(argument==undefined) argument = "00";
			if(argument.length==1) argument = "0"+argument;
			
			$scope.binaryCode[memoryIndex]=opcode+argument;
			
			if(memoryIndex==0)
			{
				$scope.assemblyExample = "For instance your first instruction '<b>{0}</b>' has been converted" +
											" to the first number in the binary code '<b>{1}</b>'." +
											" Where '<b>{2}</b>' is the code for '{3}' and '<b>{4}</b>' is the argument. ";
				$scope.assemblyExample = $scope.assemblyExample.format(line, $scope.binaryCode[0], opcode, tokens[0], argument);
			}
			
			memoryIndex++;
		});
		
		// Highlight the binaryCode box animating it
		// so the user notices it changed.
		animate("binaryCode","bounceIn");
	}
	
	$scope.resetProcessor = function()
	{
		$scope.registers.pc = 0;
		$scope.registers.idc = 0;
		$scope.registers.odc = 0;
		$scope.registers.accumulator = 0;
		$scope.lastChangedMemoryLocation=-1;
		$scope.registers.halt = false;
		
		// Provide a human readable explanation of what the next
		// instruction will do, so users can know what to expect
		// when pressing the button to execute one more step.
		$scope.nextInstructionExplanation = $scope.explain($scope.memory[$scope.registers.pc]);
	}
	
	/*
	 * Given an instruction generates an human readable
	 * explanation of what this instruction will do when 
	 * executed.
	 */
	$scope.explain = function(instruction)
	{
		var opcode = $scope.memory[$scope.registers.pc].substring(0,1);
		var argument = parseInt($scope.memory[$scope.registers.pc].substring(1,3));	
		var argumentH = Math.floor(argument/10);
		var argumentL = $scope.argument%10;			
							
		var action = "";
		switch(opcode) 
		{
			case "0": operation="inp"; action = "the next value in the input card to be read and stored in memory {0}"; break; 
			case "1": operation="cla"; action = "the accumulator to be cleared and the content of memory cell {0} to be added to it"; break; 
			case "2": operation="add"; action = "the content of memory cell {0} to be added to the accumulator"; break; 
			case "3": operation="tac"; action = "the accumulator value to be tested and, if negative, the PC will jump to {0}"; break; 
			case "4": operation="sft"; action = "the accumulator value to be shift left by {1} left and then {2} right"; break; 
			case "5": operation="out"; action = "the value in memory cell {0} to be written on the next output card value"; break;
			case "6": operation="sto"; action = "the value of accumulator to be stored in memory cell {0}"; break;
			case "7": operation="sub"; action = "the content of memory cell {0} to be subtracted from the accumulator"; break;
			case "8": operation="jmp"; action = "the PC to jump to {0}"; break;
			case "9": operation="hrs"; action = "the machine to halt and stop executing instructions"; break;
		}	
		action = action.format(argument, argumentH, argumentL);
		
		var explanation = "The instruction pointed by the current PC value is {0} ({1}) and it has argument {2}. When this will execute it will cause {3}.";
		explanation = explanation.format(opcode, operation, argument, action);
		
		explanation += "<br><br>Press <kbd>Next Step</kbd> to execute this instruction."
		
		return explanation;
	}
	
	$scope.compileToCard = function() 
	{		
		for(ix=0;ix<25;ix++)
		{
			$scope.inputCard[ix] = '000';
		}		
		var cardIndex = 0;
		var targetIndex = 10;
		$scope.inputCard[cardIndex++]="002";
		$scope.inputCard[cardIndex++]="800";
		$scope.binaryCode.forEach(function(value) 
		{
			$scope.inputCard[cardIndex++]="0"+((targetIndex<10)?"0":"")+(targetIndex++);
			$scope.inputCard[cardIndex++]=value;				
		});
		$scope.inputCard[cardIndex++]="810";
	}
	
	/*
	 * Creates and initializes variables in scope.
	 */
	function prepareScope()
	{			
		$scope.inputCard = new Array(25);		
		for(ix=0;ix<25;ix++)
		{
			$scope.inputCard[ix] = '000';
		}
	
		$scope.outputCard = new Array(25);		
		for(ix=0;ix<25;ix++)
		{
			$scope.outputCard[ix] = '000';
		}
					
		$scope.memory = new Array(100);			
		for(ix=0;ix<100;ix++)
		{
			$scope.memory[ix] = '000';
		}
		$scope.memory[0] = '001';
	
		$scope.registers = {};
		
		$scope.resetProcessor();					
	}
	
	/*
	 * Executes the INP instruction.
	 * Read one value from the current position in the input card and stores it
	 * in the specified memory location.
	 */
	function executeInp()
	{		
		$scope.memory[$scope.argument] = $scope.inputCard[$scope.registers.idc];
		$scope.registers.idc++;
		$scope.lastChangedMemoryLocation = $scope.argument;
	};
					
	/*
	 * Executes the CLA instruction.
	 * Clears the accumulator and loads it with the content of memory
	 * at the address specified by the argument.
	 */
	function executeCla()
	{
		$scope.registers.accumulator = $scope.memory[$scope.argument];				 										
	}	
		
	/*
	 * Executes the ADD instruction.
	 * Adds to the accumulator the content of memory
	 * at the address specified by the argument.
	 */
	function executeAdd()
	{
		$scope.registers.accumulator += $scope.memory[$scope.argument];
	}	
		
	/*
	 * Executes the TAC instruction.
	 * Performs a sign test on the contents of the accumulator. 
	 * If minus, jump to the position specified by argument.		 
	 */
	function executeTac()
	{
		if($scope.registers.accumulator<0)
		{				
			$scope.registers.pc = $scope.argument;
		}
	}	
		
	/*
	 * Executes the SFT instruction.
	 * Shifts the accumulator left an amount of places defined by the upper digit of the argument
	 * and then right an amount of places defined by the lower digit of the argument.
	 * This is decimal shifting.		 
	 */
	function executeSft()
	{
		$scope.registers.accumulator = $scope.registers.accumulator * Math.pow(10, Math.floor($scope.argument/10))%1000;
		$scope.registers.accumulator = Math.floor($scope.registers.accumulator / Math.pow(10, $scope.argument%10));			
	}	
	
	/*
	 * Executes the OUT instruction.
	 * Writes to the current position in the output card
	 * the value in the memory location specified by argument. 		 
	 */
	function executeOut()
	{
		$scope.outputCard[$scope.registers.odc] = $scope.memory[$scope.argument];
		$scope.registers.odc++;			
	}			
	
	/*
	 * Executes the STO instruction.
	 * Writes to the memory location specified by argument the
	 * current value of the accumulator.
	 */
	function executeSto()
	{
		$scope.memory[$scope.argument] = $scope.registers.accumulator;
		$scope.lastChangedMemoryLocation = $scope.argument;
	}	
	
	/*
	 * Executes the SUB instruction.
	 * Subtracts from the accumulator the content of memory
	 * at the address specified by the argument.
	 */
	function executeSub()
	{
		$scope.registers.accumulator -= $scope.memory[$scope.argument];
	}	

	/*
	 * Executes the JMP instruction.
	 * Jumps to the specified memory position.		 
	 */
	function executeJmp()
	{
		// Memory location '99' is always written, upon jump, with the
		// address of the instruction following the jump. This allows
		// for one level subroutines where calling JMP 99 effectively
		// is equivalent to e return from subroutine.
		var returnAddress=($scope.registers.pc);
		$scope.memory[99] = '8'+((returnAddress<10)?"0":"")+returnAddress;
		$scope.registers.pc = $scope.argument;			
	}	

	/*
	 * Executes the HRS instruction.
	 * Halts the processing.		 
	 */
	function executeHrs()
	{
		$scope.registers.pc = 0;
		$scope.registers.halt = true;
	}

	// Once the scope members have been created call once 
	// this to inizialize properly all members with default
	// values and perform a reset.
	prepareScope();		
});
