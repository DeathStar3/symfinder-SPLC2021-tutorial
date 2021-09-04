import java.util.Map;

public class D {

    private Map<Integer, B> bs ;
    private C c ;
    private Map<Integer, String> someMap;

    public D (){

    }

    public A printA (){
        System.out.println("je retourne A");
        return new A();
    }
}