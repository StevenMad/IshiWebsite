console.log("Hello World");

import java.util.*;
import java.io.*;
import java.math.*;

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
class Player {

    public static void main(String args[]) {
        Scanner in = new Scanner(System.in);
        int width = in.nextInt(); //largeur grille
        int height = in.nextInt();//hauteur grille
        int myId = in.nextInt();//mon id
        //creation du plateau
        Plateau plateau = new Plateau(width,height);
        Joueur p = new Joueur(0,0,1);
        ArrayList<Bomb> bombs =new ArrayList<Bomb>();
        // game loop
        while (true) {
            //clear the arraylist
            bombs.clear();
            //get the rows
            for (int i = 0; i < height; i++) {
                String row = in.next(); //get each row
                updateTableau(row,plateau,i);
            }
            //get the entities
            int entities = in.nextInt();
            for (int i = 0; i < entities; i++) {
                int entityType = in.nextInt();
                int owner = in.nextInt();
                int x = in.nextInt();
                int y = in.nextInt();
                int param1 = in.nextInt();
                int param2 = in.nextInt();
                //update player
                if(owner==myId && entityType==0)
                {
                    p.move(x,y);
                    p.updateBomb(param1);
                    System.err.println("Bombs left"+param1);
                }
                if(entityType==1)
                {
                    Bomb b = new Bomb(x,y,param1,param2);
                    bombs.add(b);
                    plateau.ajouterBombe(x,y);
                }
            }
            

            // Write an action using System.out.println()
            // To debug: System.err.println("Debug messages...");
            //create a disttab
            int[][] distTab = AlgoClass.createDistTab(p,width,height);
            int[] nearest = AlgoClass.getNearestBox(p,plateau,distTab,bombs);
            AlgoClass.makeAction(p,plateau,nearest,bombs);
            //System.out.println("BOMB 6 5");
        }
    }
    
    public static void updateTableau(String row,Plateau p,int j)
    {
        for(int i=0;i<row.length();i++)
        {
            if(row.charAt(i)=='.')
            {
                p.removeBox(i,j);
            }
            else if(row.charAt(i)=='X')
            {
                p.ajouterMur(i,j);
            }else{
                p.ajouterBox(i,j);
            }
        }
    }
}

    /*-----------------------------------------------------------*/
    /*                         --------                          */
    /*                        |CLASSES|                          */
    /*                        --------                           */
    /*-----------------------------------------------------------*/

//Joueur class
class Joueur
{
    int x;
    int y;
    int bomb;
    
    public Joueur(int x,int y, int nbBomb)
    {
        this.x=x;
        this.y=y;
        this.bomb=nbBomb;
    }
    
    public void move(int x, int y)
    {
        this.x=x;
        this.y=y;
    }
    
    public boolean canPutBomb()
    {
        return bomb>0;
    }
    
    public void putBomb()
    {
        if(canPutBomb())
            bomb=bomb-1;
    }
    
    public void updateBomb(int param1)
    {
        this.bomb = param1;
    }
}

//class Bomb
class Bomb
{
    int x;
    int y;
    int timeLeft;
    int range;
    
    public Bomb(int x,int y, int timeLeft, int range)
    {
        this.x=x;
        this.y=y;
        this.timeLeft=timeLeft;
        this.range=range;
    }
    
}
    
//Plateau Class
class Plateau
{
    char[][] tableau;
    int height;
    int width;
    ArrayList<Bomb> bombs;
    
    public Plateau(int x,int y)
    {
        width=x;
        height=y;
        tableau = new char[x][y];
        for(int i=0;i<x;i++)
            for(int j=0;j<y;j++)
                tableau[i][j]='.';
    }
    
    public Plateau()
    {
        width=13;
        height=11;
        tableau = new char[13][11];
        for(int i=0;i<13;i++)
            for(int j=0;j<11;j++)
                tableau[i][j]='.';
    }
    
    //methods
    
    public void ajouterBox(int x,int y)
    {
        tableau[x][y]='0';
    }
    
    public void removeBox(int i,int j)
    {
        tableau[i][j]='.';
    }
    
    public void ajouterMur(int i,int j)
    {
        tableau[i][j]='X';
    }
    
    public void ajouterBombe(int i,int j)
    {
        tableau[i][j]='B';
    }
    
    public char getElem(int x, int y)
    {
        return tableau[x][y];
    }
    
    public String toString(){
        String s="";
        for(int j=0;j<height;j++)
        {
            for(int i=0;i<width;i++)
                s+=tableau[i][j];
            s+="\n";
        }
        return s;
    }
    
    
}



    /*-----------------------------------------------------------*/
    /*                        ----------                         */
    /*                       |ALGORYTHM|                         */
    /*                       ----------                          */
    /*-----------------------------------------------------------*/
class AlgoClass
{
    int width;
    int height;
    
     /*-----------------------------------------------------------*/
    /*                         --------                          */
    /*                        | MATHS |                          */
    /*                        --------                           */
    /*-----------------------------------------------------------*/
    public static int[][] createDistTab(Joueur p,int width,int height)
    {
        int[][] distTab = new int[width][height];
        int x=p.x;
        int y=p.y;
        for(int i=0;i<width;i++)
        {
            for(int j=0;j<height;j++)
            {
                distTab[i][j]=cartesien(x,i,y,j);
            }
        }
        return distTab;
    }
    
    public static int cartesien(int xA,int xB, int yA, int yB)
    {
        return Math.abs(xB-xA)+Math.abs(yB-yA);
    }
    
    
    public static char[][] createDistWithWalls(Joueur p,int width,int height,Plateau pl)
    {
        char[][] distTab = new char[width][height];
        int x=p.x;
        int y=p.y;
        for(int i=0;i<width;i++)
        {
            for(int j=0;j<height;j++)
            {
                distTab[i][j]=String.valueOf(cartesien(x,i,y,j)).charAt(0);
                if(pl.getElem(i,j)!='.')
                    distTab[i][j]='X';
            }
        }
        return distTab;   
    }
    
    public static int[][] createTabBomb(Joueur p,int width, int height,ArrayList<Bomb> bombs)
    {
        int[][] distTab = new int[width][height];
        int i,j;
        //init tab
        for(i=0;i<width;i++)
            {
                for(j=0;j<height;j++)
                {                    
                    distTab[i][j]=0;
                }
            }
        for(Bomb b:bombs)
        {
            for( i=0;i<width;i++)
            {
                for( j=0;j<height;j++)
                {   
                    if(Math.abs(b.x-i)<3 && j==b.y)
                        distTab[i][j]=1;
                    if(Math.abs(b.y-j)<3 && i==b.x)
                        distTab[i][j]=1;
                }
            }
        }
        return distTab;
    }
    
    
    /*-----------------------------------------------------------*/
    /*                         --------                          */
    /*                        |LOGICAL|                          */
    /*                        --------                           */
    /*-----------------------------------------------------------*/
        
    
    public static int[] getNearestBox(Joueur j, Plateau p, int[][] distTab)
    {
        int min=30;
        int minx=0;
        int miny=0;
        for(int x=0;x<p.width;x++)
        {
            for(int y=0;y<p.height;y++)
            {
                if(p.getElem(x,y)!='.' && p.getElem(x,y)!='X')
                    if(distTab[x][y]<min)
                    {
                        min=distTab[x][y];
                        minx=x;
                        miny=y;
                    }
            }
        }
        int[] res = new int[2];
        res[0] = minx;
        res[1] = miny;
        return res;
    }
    
    
    public static boolean isCatchable(int xa,int xb,int ya,int yb)
    {
        return (xa==xb || ya==yb);
        
    }
    
    
    public static int[] getNearestBox(Joueur j, Plateau p, int[][] distTab, ArrayList<Bomb> bombs)
    {
        int min=30;
        int minx=0;
        int miny=0;
        int[][] tabBomb=createTabBomb(j,p.width,p.height,bombs);
         for(int x=0;x<p.width;x++)
        {
            for(int y=0;y<p.height;y++)
            {
                if(p.getElem(x,y)!='.' && p.getElem(x,y)!='X' && tabBomb[x][y]!=1)
                    if(distTab[x][y]<min)
                    {
                        min=distTab[x][y];
                        minx=x;
                        miny=y;
                    }
            }
        }
        int[] res = new int[2];
        res[0] = minx;
        res[1] = miny;
        return res;
        
    }
    
    
    public static boolean isPossiblePlace(char[][] p, int bx, int by, int cx, int cy)
    {
        if(isCatchable(bx,cx,by,cy))
            return false;
        if(p[cx][cy]!='X')
            return true;
        return false;
    }
    
    public static int[] getClosestPossiblePlace(Joueur j, Plateau p,Bomb b)
    {
        char[][] dist = createDistWithWalls(j,p.width,p.height,p);
        int min=30;
        int minx=0;
        int miny=0;
        for(int i=0;i<p.width;i++)
        {
            for(int i1=0;i1<p.height;i1++)
            {
                if(isPossiblePlace(dist,b.x,b.y,i,i1) && Integer.valueOf(Character.toString(dist[i][i1]))<min )
                {
                    min=Integer.valueOf(Character.toString(dist[i][i1]));
                    minx=i;
                    miny=i1;
                }
            }
        }
        int[] nearest = {minx,miny,min};
        return nearest;
    }
    
    public static int[] getClosestPossiblePlace(Joueur j, Plateau p,ArrayList<Bomb> bombs)
    {
        int[] min ={0,0,30};
        System.err.println("JOUEUR "+j.x+" "+j.y);
        for(Bomb b:bombs)
        {
            int[] tmp = getClosestPossiblePlace(j,p,b);
            if(tmp[2]<min[2])
            {
                min=tmp;
            }
        }
        return min;
    }
    
    /*-----------------------------------------------------------*/
    /*                         --------                          */
    /*                        |ACTIONS|                          */
    /*                        --------                           */
    /*-----------------------------------------------------------*/
    
    public static void makeAction(Joueur j,Plateau p, int[] nearestBox, ArrayList<Bomb> bombs)
    {
        System.err.println("NEARESTBOX "+nearestBox[0]+" "+nearestBox[1]);
           int[] nearest = getClosestPossiblePlace(j,p,bombs);
        if(cartesien(j.x,nearestBox[0],j.y,nearestBox[1]) <3)
        {
            if(!isCatchable(j.x,nearestBox[0],j.y,nearestBox[1]))
            {
                System.out.println("MOVE "+nearestBox[0]+" "+nearestBox[1]);
                return;
            }
                System.err.println("NEAREST "+nearest[0]+" "+nearest[1]);
                System.out.println("BOMB "+nearest[0]+" "+nearest[1]);
                return;
        }
        System.out.println("MOVE "+nearestBox[0]+" "+nearestBox[1]);
        return;
    }
    
    public static void makeAction(Joueur j,Plateau p, int[] nearestBox)
    {
        System.err.println("NEARESTBOX "+nearestBox[0]+" "+nearestBox[1]);
        if(cartesien(j.x,nearestBox[0],j.y,nearestBox[1]) <3)
        {
            if(!isCatchable(j.x,nearestBox[0],j.y,nearestBox[1]))
            {
                System.out.println("MOVE "+nearestBox[0]+" "+nearestBox[1]);
                return;
            }
                int[][] dt = createDistTab(j,p.width,p.height);
                int[] nearest = getNearestBox(j,p,dt);
                System.err.println("NEAREST "+nearest[0]+" "+nearest[1]);
                System.out.println("BOMB "+nearest[0]+" "+nearest[1]);
                return;
        }
        System.out.println("MOVE "+nearestBox[0]+" "+nearestBox[1]);
        return;
    }
}

